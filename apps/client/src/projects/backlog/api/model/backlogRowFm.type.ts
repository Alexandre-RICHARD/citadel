import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import type { UserGameAggregates } from "@citadel/specs/src/projects/backlog/rule/aggregate/userGameAggregates.type";

import type { CompanyFm } from "./companyFm.type";
import type { DlcFm } from "./dlcFm.type";
import type { PlatformFm } from "./platformFm.type";
import type { SeriesFm } from "./seriesFm.type";
import type { UserVersionRowFm } from "./userVersionRowFm.type";

// Ligne d'un jeu du backlog : le jeu, sa personnalisation et les agrégats de ses versions jouées (cahier des charges, §7)
export type BacklogRowFm = UserGameAggregates & {
	gameId: number;
	imageId: string | null;
	name: string;
	frenchName: string | null;
	// Ligne à version jouée unique : le titre de sa version, s'il ne s'agit pas de l'originale
	versionTitle: string | null;
	series: SeriesFm | null;
	proposedSeries: SeriesFm | null;
	seriesNumber: number | null;
	seriesNumberLabel: string | null;
	developer: CompanyFm | null;
	publisher: CompanyFm | null;
	releaseDate: string | null;
	isCancelled: boolean;
	endingType: EndingTypeEnum;
	// null si plusieurs versions jouées
	platform: PlatformFm | null;
	igdbUrl: string;
	dlcs: DlcFm[];
	// Dépliable à partir de deux
	userVersionRows: UserVersionRowFm[];
	// Ajouté de façon optimiste, en attente du serveur : grisé et inerte
	isTemporary: boolean;
};
