import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const GOOGLE_TRANSLATE_API_KEY = defineSecret("GOOGLE_TRANSLATE_API_KEY");

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

type TranslateRequest = {
  texts: string[];
  target: string;
  source?: string;
};

type TranslateResponse = {
  translations: string[];
};

/**
 * Server-side proxy for Google Cloud Translation so the API key never ships
 * inside the mobile app bundle. Mirrors the request/response shape the
 * client's googleTranslate.ts already expects (texts[] -> translations[]),
 * so the client switches to this automatically once Firebase is configured
 * — see src/shared/i18n/googleTranslate.ts.
 *
 * Deploy steps: see functions/README.md.
 */
export const translateProxy = onCall(
  { secrets: [GOOGLE_TRANSLATE_API_KEY], region: "us-central1", maxInstances: 10 },
  async (request) => {
    const data = (request.data ?? {}) as Partial<TranslateRequest>;
    const { texts, target, source = "en" } = data;

    if (!Array.isArray(texts) || texts.length === 0) {
      throw new HttpsError("invalid-argument", "texts must be a non-empty string array");
    }
    if (texts.length > 100) {
      throw new HttpsError("invalid-argument", "texts must be 100 items or fewer per call");
    }
    if (!target || typeof target !== "string") {
      throw new HttpsError("invalid-argument", "target is required");
    }

    const apiKey = GOOGLE_TRANSLATE_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "GOOGLE_TRANSLATE_API_KEY secret is not set");
    }

    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts, source, target, format: "text" }),
    });

    const json = (await res.json()) as {
      data?: { translations?: { translatedText: string }[] };
      error?: { message?: string };
    };

    if (!res.ok || !json.data?.translations) {
      throw new HttpsError("internal", json.error?.message ?? `Translate API failed (${res.status})`);
    }

    const translations = json.data.translations.map((t, i) => t.translatedText || texts[i]);
    return { translations } satisfies TranslateResponse;
  }
);
