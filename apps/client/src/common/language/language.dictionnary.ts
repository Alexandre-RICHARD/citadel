import { LanguageEnum } from "./language.enum.ts";
import { LanguageLongCodeEnum } from "./languageLongCode.enum.ts";
import { LanguageShortCodeEnum } from "./languageShortCode.enum.ts";

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
