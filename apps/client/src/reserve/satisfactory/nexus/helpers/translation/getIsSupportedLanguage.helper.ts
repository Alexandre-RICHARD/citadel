import type { LanguageEnum } from "../../enums/language.enum";

export const getIsSupportedLanguage = (
	supportedLanguages: LanguageEnum[],
	language?: LanguageEnum,
): boolean => {
	if (!language) return false;

	return supportedLanguages.includes(language);
};
