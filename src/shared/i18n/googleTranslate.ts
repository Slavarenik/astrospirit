import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { httpsCallable } from "firebase/functions";
import type { Locale } from "@shared/storage/useLocaleStore";
import { GOOGLE_TRANSLATE_API_KEY } from "./translateEnv";
import { isFirebaseConfigured, getFirebaseFunctions } from "@shared/firebase/firebaseClient";

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
/** Bump this to invalidate bad cache entries (e.g. English stored under ru/uk). */
const CACHE_PREFIX = "astrospirit/gt/v2/";
const MEMORY = new Map<string, string>();
const BATCH_LIMIT = 100;

let warnedMissingKey = false;
let loggedReady = false;
let purgedOldCache = false;

function getApiKey(): string | undefined {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
    googleTranslateApiKey?: string;
  };
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  const key = String(GOOGLE_TRANSLATE_API_KEY || fromEnv || extra.googleTranslateApiKey || "").trim();
  return key || undefined;
}

function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h) ^ text.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function cacheKey(text: string, target: Locale): string {
  return `${CACHE_PREFIX}${target}:${hashText(text)}:${text.length}`;
}

/** Drop v1 cache keys that may have stored untranslated English as "ru"/"uk". */
async function purgeLegacyCacheOnce(): Promise<void> {
  if (purgedOldCache) return;
  purgedOldCache = true;
  try {
    const keys = await AsyncStorage.getAllKeys();
    const legacy = keys.filter((k) => k.startsWith("astrospirit/gt/v1/"));
    if (legacy.length) {
      await AsyncStorage.multiRemove(legacy);
      console.log(`[i18n] purged ${legacy.length} stale translation cache entries`);
    }
  } catch {
    // ignore
  }
}

async function readCache(text: string, target: Locale): Promise<string | null> {
  await purgeLegacyCacheOnce();
  const key = cacheKey(text, target);
  const mem = MEMORY.get(key);
  if (mem) return mem;
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      // Never trust a "translation" that is identical to the English source
      // for non-English locales (legacy bug cached untranslated text).
      if (target !== "en" && stored === text) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      MEMORY.set(key, stored);
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeCache(text: string, target: Locale, translated: string): Promise<void> {
  if (target !== "en" && translated === text) return; // don't cache failed/no-op translations
  const key = cacheKey(text, target);
  MEMORY.set(key, translated);
  try {
    await AsyncStorage.setItem(key, translated);
  } catch {
    // ignore
  }
}

type GoogleTranslateResponse = {
  data?: { translations?: { translatedText: string }[] };
  error?: { message?: string };
};

class TranslateConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslateConfigError";
  }
}

/** Server-side path: calls the `translateProxy` Cloud Function so the
 *  Translate API key stays server-only and is never bundled into the app.
 *  Used automatically once Firebase is configured (see functions/). */
async function requestTranslateViaProxy(texts: string[], target: Locale, source: Locale): Promise<string[]> {
  const call = httpsCallable<{ texts: string[]; target: string; source: string }, { translations: string[] }>(
    getFirebaseFunctions(),
    "translateProxy"
  );
  const res = await call({ texts, target, source });
  return res.data.translations.map((t, i) => t || texts[i]);
}

/** Dev-only direct path: calls Google Translate straight from the client
 *  with EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY. Fine for local development
 *  before Firebase is set up; not safe to ship (the key is extractable from
 *  the app bundle) — see the security note in .env.example / DEVLOG.md. */
async function requestTranslateDirect(texts: string[], target: Locale, source: Locale): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn(
        "[i18n] Google Translate API key missing — check Astro Spirit/.env and restart with: npx expo start -c"
      );
    }
    throw new TranslateConfigError("missing api key");
  }

  if (!loggedReady) {
    loggedReady = true;
    console.log(`[i18n] Google Translate ready, direct mode (…${apiKey.slice(-4)})`);
  }

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source,
      target,
      format: "text",
    }),
  });

  const json = (await res.json()) as GoogleTranslateResponse;
  if (!res.ok || !json.data?.translations) {
    const msg = json.error?.message ?? `Google Translate failed (${res.status})`;
    console.warn("[i18n] Translate API error:", msg);
    throw new Error(msg);
  }

  return json.data.translations.map((t, i) => t.translatedText || texts[i]);
}

async function requestTranslate(texts: string[], target: Locale, source: Locale): Promise<string[]> {
  if (isFirebaseConfigured()) {
    if (!loggedReady) {
      loggedReady = true;
      console.log("[i18n] Google Translate ready, proxied via Cloud Function");
    }
    try {
      const out = await requestTranslateViaProxy(texts, target, source);
      console.log(
        `[i18n] ok (proxy) → ${target}: "${texts[0]?.slice(0, 40)}…" → "${out[0]?.slice(0, 40)}…"`
      );
      return out;
    } catch (err) {
      // Fall through to the direct path (e.g. function not deployed yet)
      // rather than failing translation outright.
      console.warn("[i18n] translateProxy call failed, falling back to direct:", err);
    }
  }

  const out = await requestTranslateDirect(texts, target, source);
  console.log(
    `[i18n] ok (direct) → ${target}: "${texts[0]?.slice(0, 40)}…" → "${out[0]?.slice(0, 40)}…"`
  );
  return out;
}

export async function translateTexts(
  texts: string[],
  target: Locale,
  source: Locale = "en"
): Promise<string[]> {
  if (target === source || texts.length === 0) return texts;

  await purgeLegacyCacheOnce();

  const results = new Array<string>(texts.length);
  const pendingIdx: number[] = [];
  const pendingTexts: string[] = [];

  await Promise.all(
    texts.map(async (text, i) => {
      if (!text) {
        results[i] = text;
        return;
      }
      const cached = await readCache(text, target);
      if (cached != null) {
        results[i] = cached;
        return;
      }
      pendingIdx.push(i);
      pendingTexts.push(text);
    })
  );

  if (pendingTexts.length === 0) {
    if (__DEV__ && texts.some(Boolean)) {
      console.log(`[i18n] cache hit → ${target} (${texts.length} strings)`);
    }
    return results;
  }

  try {
    for (let offset = 0; offset < pendingTexts.length; offset += BATCH_LIMIT) {
      const chunk = pendingTexts.slice(offset, offset + BATCH_LIMIT);
      const chunkIdx = pendingIdx.slice(offset, offset + BATCH_LIMIT);
      const translated = await requestTranslate(chunk, target, source);
      await Promise.all(
        translated.map(async (out, j) => {
          results[chunkIdx[j]] = out;
          await writeCache(chunk[j], target, out);
        })
      );
    }
  } catch (err) {
    if (!(err instanceof TranslateConfigError)) {
      console.warn("[i18n] Google Translate request failed, using source text:", err);
    }
    pendingIdx.forEach((i) => {
      if (results[i] == null) results[i] = texts[i];
    });
  }

  return results.map((r, i) => r ?? texts[i]);
}

export async function translateText(text: string, target: Locale, source: Locale = "en"): Promise<string> {
  const [out] = await translateTexts([text], target, source);
  return out;
}

export function isGoogleTranslateConfigured(): boolean {
  return isFirebaseConfigured() || !!getApiKey();
}

/** Clear all translation caches (v1 + v2). Useful after fixing a bad cache. */
export async function clearTranslationCache(): Promise<void> {
  MEMORY.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const gt = keys.filter((k) => k.startsWith("astrospirit/gt/"));
    if (gt.length) await AsyncStorage.multiRemove(gt);
    console.log(`[i18n] cleared ${gt.length} translation cache keys`);
  } catch (err) {
    console.warn("[i18n] clearTranslationCache failed", err);
  }
}
