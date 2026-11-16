import type { LanguageTagEnum } from "../../enum/languageTag.enum.ts";

// Une étiquette « Langues », avec le nombre de fichiers qui l'ont (« VF 18 / 26 » sur une saison ; 1 pour un film)
export type LanguageTagCountDto = {
	tag: LanguageTagEnum;
	count: number;
};
