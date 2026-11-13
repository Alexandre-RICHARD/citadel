import { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

// Un statut de fin atteint en y jouant (pas « Vu sans jouer ») : il propose la date de fin
export function isFinishedByPlayingStatus(status: StatusEnum): boolean {
	return isFinishedStatus(status) && status !== StatusEnum.WATCHED;
}
