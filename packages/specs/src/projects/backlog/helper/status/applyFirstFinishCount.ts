import type { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

// Passer une version jouée à un statut de fin (« Vu sans jouer » compris) passe « fois fini (sûr) » à 1 s'il était à 0
export function applyFirstFinishCount(
	status: StatusEnum,
	sureFinishCount: number,
): number {
	return isFinishedStatus(status) && sureFinishCount === 0
		? 1
		: sureFinishCount;
}
