import { LanguageEnum } from "../enum/language.enum";

export const languageDictionnary: Record<
	LanguageEnum,
	{
		shortCode: string;
		longCode: string;
	}
> = {
	[LanguageEnum.FRENCH]: {
		shortCode: "fr",
		longCode: "fr-FR",
	},
	[LanguageEnum.ENGLISH]: {
		shortCode: "en",
		longCode: "en-US",
	},
};
