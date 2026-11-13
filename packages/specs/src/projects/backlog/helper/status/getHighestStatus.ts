import type { StatusEnum } from "../../enum/status.enum.ts";
import { statusRanks } from "./statusRanks.ts";

// Le statut de plus haut rang, le premier en cas d'égalité ; `null` pour une liste vide
export function getHighestStatus(statuses: StatusEnum[]): StatusEnum | null {
	let highest: StatusEnum | null = null;
	for (const status of statuses)
		if (highest === null || statusRanks[status] > statusRanks[highest])
			highest = status;
	return highest;
}
