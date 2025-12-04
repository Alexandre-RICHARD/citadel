import { useContext } from "react";

import { TranslationsContext } from "../contexts/translations/Translations.context";

export const useTranslations = () => {
  const translations = useContext(TranslationsContext);
  const Nt = (files: string, key: string): string => {
    const string = translations?.[files]?.[key] ?? "";
    if (!string) return key.toLowerCase();
    return string;
  };

  return Nt;
};
