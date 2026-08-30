import type { LanguageCodeEnum } from "../../../nexus/enums/languageCode.enum";

export type TranslationSliceType = {
	language: LanguageCodeEnum;
	setLanguage: (newLanguage: LanguageCodeEnum) => void;
};
