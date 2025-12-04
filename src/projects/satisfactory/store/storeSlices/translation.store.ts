import {
  LanguageEnum,
  selectedLanguageInitiator,
  setCookie,
} from "@nexus/nexusExporter";
import type { StateCreator } from "zustand";

import { supportedLanguages } from "../../dictionnaries/supportedLanguages.dictionnary";
import { CookieEnum } from "../../enums/cookie.enum";
import type { TranslationSliceType } from "../../types/store/storeSlices/translations.type";

export const useTranslationStore: StateCreator<TranslationSliceType> = (
  set,
) => ({
  language: selectedLanguageInitiator({
    supportedLanguages,
    cookieName: CookieEnum.LANG,
    defaultLanguage: LanguageEnum.FRENCH,
  }),
  setLanguage: (newLanguageCode) => {
    setCookie({
      name: CookieEnum.LANG,
      value: newLanguageCode,
      hours: 24 * 365,
    });
    set(() => ({ language: newLanguageCode }));
  },
});
