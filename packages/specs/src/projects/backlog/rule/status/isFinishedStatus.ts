import type { StatusEnum } from "../../enum/status.enum.ts";
import { statusRanks } from "./statusRanks.ts";

const FIRST_FINISHED_RANK = 5;

// Rang 5 ou plus : la version jouée est finie
export function isFinishedStatus(status: StatusEnum): boolean {
	return (statusRanks[status] ?? 0) >= FIRST_FINISHED_RANK;
}
