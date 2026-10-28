import { useLocaleStore, Locale } from "@shared/storage/useLocaleStore";
import { translations, TranslationDict } from "./translations";

export type { Locale };
export { translations };
export {
  translateText,
  translateTexts,
  isGoogleTranslateConfigured,
  clearTranslationCache,
} from "./googleTranslate";
export { useTranslatedText, useTranslatedTexts } from "./useTranslatedText";

function getByPath(dict: TranslationDict, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object") return (node as Record<string, unknown>)[key];
    return undefined;
  }, dict);
}

/** useT()("onboarding.welcome.title") — dotted-path lookup into the active
 *  locale's dictionary, falling back to English if a key is ever missing
 *  (translator added a string without the other two locales catching up),
 *  and finally to the path itself so a typo is visible instead of blank. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return function t(path: string): string {
    const value = getByPath(translations[locale], path);
    if (typeof value === "string") return value;
    const fallback = getByPath(translations.en, path);
    return typeof fallback === "string" ? fallback : path;
  };
}

/** Same lookup as useT, but for array-valued keys (e.g. a list of steps). */
export function useTList(path: string): string[] {
  const locale = useLocaleStore((s) => s.locale);
  const value = getByPath(translations[locale], path);
  if (Array.isArray(value)) return value as string[];
  const fallback = getByPath(translations.en, path);
  return Array.isArray(fallback) ? (fallback as string[]) : [];
}

export { useLocaleStore };
