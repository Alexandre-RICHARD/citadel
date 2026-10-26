import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";

// Les données de jeu d'une version jouée, modifiables dans le tableau
export type UserVersionDataBean = {
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
};
