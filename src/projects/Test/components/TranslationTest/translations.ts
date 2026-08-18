import { LanguageEnum } from "../../../../common/language/language.enum";

type Translations = {
	a: string;
	b: (count: number) => string;
	c: (text: string) => string;
};

export const translations: Record<LanguageEnum, Translations> = {
	[LanguageEnum.FRENCH]: {
		a: "prout",
		b: (count) => {
			if (count === 0) return "Rien";
			if (count === 1) return "Un seul";
			return "Beaucoup";
		},
		c: (text) => {
			return `Mon ${text}`;
		},
	},
	[LanguageEnum.ENGLISH]: {
		a: "pouet",
		b: (count) => {
			if (count === 0) return "Nothing";
			if (count === 1) return "Only one";
			return "Lot";
		},
		c: (text) => {
			return `My ${text}`;
		},
	},
};
