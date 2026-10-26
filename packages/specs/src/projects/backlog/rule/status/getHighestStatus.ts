import type { StatusEnum } from "../../enum/status.enum.ts";
import { statusRanks } from "./statusRanks.ts";

// Le statut de plus haut rang, le premier en cas d'égalité ; « Abandonné », hors échelle, n'est jamais retenu
export function getHighestStatus(statuses: StatusEnum[]): StatusEnum | null {
	let highest: StatusEnum | null = null;
	let highestRank = 0;
	for (const status of statuses) {
		const rank = statusRanks[status];
		if (rank !== null && rank > highestRank) {
			highest = status;
			highestRank = rank;
		}
	}
	return highest;
}
