import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

// Libellé et signification de chaque type de fin
export const endingTypeLabels: Readonly<
	Record<EndingTypeEnum, { label: string; meaning: string }>
> = {
	[EndingTypeEnum.STORY]: {
		label: "Histoire",
		meaning: "Une fin scénarisée : générique vu",
	},
	[EndingTypeEnum.RUNS]: {
		label: "Runs",
		meaning:
			"Des parties recommencées ; fini = première victoire ou fin principale",
	},
	[EndingTypeEnum.SANDBOX]: {
		label: "Bac à sable",
		meaning: "Pas de fin imposée ; fini quand j'estime en avoir fait le tour",
	},
	[EndingTypeEnum.MULTIPLAYER]: {
		label: "Multijoueur",
		meaning: "Jeu en ligne ou compétitif sans fin ; jamais vraiment fini",
	},
};
