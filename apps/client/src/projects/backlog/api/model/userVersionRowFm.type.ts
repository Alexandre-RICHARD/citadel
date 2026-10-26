import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

import type { PlatformFm } from "./platformFm.type";

// Sous-ligne du tableau : une version jouée, ses données et ses agrégats propres
export type UserVersionRowFm = {
	userVersionId: number;
	versionId: number;
	coverImageId: string | null;
	// null pour la version originale
	versionTitle: string | null;
	releaseDate: string | null;
	platform: PlatformFm;
	status: StatusEnum;
	isOwned: boolean;
	isUpNext: boolean;
	finishDate: string | null;
	sureFinishCount: number;
	probableFinishCount: number;
	doneDlcIds: number[];
	doneDlcCount: number;
	dlcCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	totalPlayTimeMinutes: number;
	rating: number | null;
	comment: string | null;
	igdbUrl: string;
	// Créée de façon optimiste, en attente du serveur : grisée et inerte
	isTemporary: boolean;
};
