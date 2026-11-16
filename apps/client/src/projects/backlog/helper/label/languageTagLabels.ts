import { LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum";

export const languageTagLabels: Readonly<Record<LanguageTagEnum, string>> = {
	[LanguageTagEnum.VF]: "VF",
	[LanguageTagEnum.VO]: "VO",
	[LanguageTagEnum.STFR]: "STFR",
	[LanguageTagEnum.STVO]: "STVO",
	[LanguageTagEnum.UNKNOWN]: "Inconnue",
};
