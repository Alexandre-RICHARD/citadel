import type { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

// Passer une version jouée au rang 5 ou plus passe « fois fini (sûr) » à 1 s'il était à 0
export function applyFirstFinishCount(
	status: StatusEnum,
	sureFinishCount: number,
): number {
	return isFinishedStatus(status) && sureFinishCount === 0
		? 1
		: sureFinishCount;
}
