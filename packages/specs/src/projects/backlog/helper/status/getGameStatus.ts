import { StatusEnum } from "../../enum/status.enum.ts";
import { getHighestStatus } from "./getHighestStatus.ts";

// Statut de la ligne d'un jeu : le plus avancé de ses versions jouées dans l'ordre des statuts (« Abandonné » passe donc
// devant « Pas commencé », « Vu sans jouer » devant « Bien entamé »)
export function getGameStatus(statuses: StatusEnum[]): StatusEnum {
	return getHighestStatus(statuses) ?? StatusEnum.NOT_STARTED;
}
