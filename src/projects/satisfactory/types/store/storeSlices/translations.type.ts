import type { LanguageCodeEnum } from "@nexus/nexusExporter";

export type TranslationSliceType = {
  language: LanguageCodeEnum;
  setLanguage: (newLanguage: LanguageCodeEnum) => void;
};
