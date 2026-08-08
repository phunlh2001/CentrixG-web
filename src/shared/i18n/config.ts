import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationCN from "./locales/cn.json";
import translationEN from "./locales/en.json";
import translationVI from "./locales/vi.json";

export type LanguageCode = keyof typeof LANGUAGE_RESOURCES;

const LANGUAGE_RESOURCES = {
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  },
  zh: {
    translation: translationCN,
  },
};

const savedLang =
  typeof window !== "undefined"
    ? localStorage.getItem("lang")
    : null;

const initialLng =
  savedLang === "vi" || savedLang === "en" || savedLang === "zh"
    ? savedLang
    : "vi";

i18n
  .use(initReactI18next)
  .init({
    resources: LANGUAGE_RESOURCES,
    lng: initialLng,
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
