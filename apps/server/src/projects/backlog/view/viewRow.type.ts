import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import type { UserGameAggregates } from "@citadel/specs/src/projects/backlog/rule/aggregate/userGameAggregates.type.ts";

// Ce qu'une ligne affiche, colonne par colonne : ce sur quoi elle se trie et se filtre
export type ViewRow = UserGameAggregates & {
	name: string;
	frenchName: string | null;
	// Ligne à version jouée unique, ou sous-ligne : le titre de sa version
	versionTitle: string | null;
	seriesName: string | null;
	seriesNumber: number | null;
	developerName: string | null;
	publisherName: string | null;
	releaseDate: string | null;
	endingType: EndingTypeEnum;
	// Vide sur la ligne d'un jeu à plusieurs versions jouées
	platformName: string | null;
};
