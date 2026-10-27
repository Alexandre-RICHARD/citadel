import type { StatusEnum } from "../../enum/status.enum.ts";

// Ce qu'une version jouée apporte aux agrégats de la ligne de son jeu
export type AggregatedUserVersion = {
	status: StatusEnum;
	isOwned: boolean;
	isUpNext: boolean;
	finishDate: string | null;
	sureFinishCount: number;
	probableFinishCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	rating: number | null;
	comment: string | null;
	doneDlcIds: number[];
};
