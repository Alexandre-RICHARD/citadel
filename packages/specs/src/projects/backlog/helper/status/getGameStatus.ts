import { StatusEnum } from "../../enum/status.enum.ts";
import { getHighestStatus } from "./getHighestStatus.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

/**
 * Statut de la ligne d'un jeu : les « Pas commencé » sont ignorées tant qu'une autre version jouée
 * a un statut, puis la première situation qui correspond l'emporte. `null` : impossible de choisir.
 */
export function getGameStatus(statuses: StatusEnum[]): StatusEnum | null {
	const played = statuses.filter((status) => status !== StatusEnum.NOT_STARTED);
	// Toutes « Pas commencé »
	if (played.length === 0) return StatusEnum.NOT_STARTED;

	// Au moins une au rang 5 ou plus : le plus haut de ces statuts
	const finished = played.filter(isFinishedStatus);
	if (finished.length > 0) return getHighestStatus(finished);

	// Toutes « Abandonné »
	if (played.every((status) => status === StatusEnum.ABANDONED))
		return StatusEnum.ABANDONED;

	// Aucune « Abandonné » : le plus haut statut
	if (!played.includes(StatusEnum.ABANDONED)) return getHighestStatus(played);

	// « Abandonné » mêlé à un statut en cours (rangs 2 à 4)
	return null;
}
