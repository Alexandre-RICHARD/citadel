import type { StatusEnum } from "../../enum/status.enum.ts";
import { statusRanks } from "./statusRanks.ts";

const FIRST_FINISHED_RANK = 5;

// Rang 5 ou plus : la version jouée est finie en y jouant (pas « Vu sans jouer »), ce qui propose la date de fin
export function isFinishedByPlayingStatus(status: StatusEnum): boolean {
	return (statusRanks[status] ?? 0) >= FIRST_FINISHED_RANK;
}
