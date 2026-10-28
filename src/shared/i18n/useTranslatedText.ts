import { useEffect, useState } from "react";
import { useLocaleStore } from "@shared/storage/useLocaleStore";
import { translateText, translateTexts } from "./googleTranslate";

/** Live-translate a single dynamic English string into the active locale. */
export function useTranslatedText(sourceText: string): { text: string; loading: boolean } {
  const locale = useLocaleStore((s) => s.locale);
  const [text, setText] = useState(sourceText);
  const [loading, setLoading] = useState(locale !== "en" && !!sourceText);

  useEffect(() => {
    let cancelled = false;

    if (locale === "en" || !sourceText) {
      setText(sourceText);
      setLoading(false);
      return;
    }

    setLoading(true);
    translateText(sourceText, locale).then((out) => {
      if (cancelled) return;
      setText(out);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [sourceText, locale]);

  return { text, loading };
}

/** Live-translate a list of English strings (batched + cached). */
export function useTranslatedTexts(sourceTexts: string[]): { texts: string[]; loading: boolean } {
  const locale = useLocaleStore((s) => s.locale);
  const fingerprint = sourceTexts.join("\u0001");
  const [texts, setTexts] = useState(sourceTexts);
  const [loading, setLoading] = useState(locale !== "en" && sourceTexts.some(Boolean));

  useEffect(() => {
    let cancelled = false;
    const current = fingerprint.split("\u0001");

    if (locale === "en" || current.length === 0) {
      setTexts(current);
      setLoading(false);
      return;
    }

    setLoading(true);
    translateTexts(current, locale).then((out) => {
      if (cancelled) return;
      setTexts(out);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fingerprint, locale]);

  return { texts, loading };
}
