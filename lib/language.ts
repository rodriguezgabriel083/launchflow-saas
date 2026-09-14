import type { Language } from "./i18n";

const languageKey = "launchflow-language";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(languageKey) === "es" ? "es" : "en";
}

export function storeLanguage(language: Language) {
  window.localStorage.setItem(languageKey, language);
}
