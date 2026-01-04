import { LanguageEnum } from "./language.enum";
import { LanguageLongCodeEnum } from "./languageLongCode.enum";
import { LanguageShortCodeEnum } from "./languageShortCode.enum";

export const languageDictionnary: Record<
	LanguageEnum,
	{
		shortCode: LanguageShortCodeEnum;
		longCode: LanguageLongCodeEnum;
	}
> = {
	[LanguageEnum.FRENCH]: {
		shortCode: LanguageShortCodeEnum.FR,
		longCode: LanguageLongCodeEnum.FR,
	},
	[LanguageEnum.ENGLISH]: {
		shortCode: LanguageShortCodeEnum.EN,
		longCode: LanguageLongCodeEnum.EN,
	},
};
