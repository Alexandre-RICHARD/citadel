import type { DeployHistoryEntry } from "../../shared/deployHistoryEntry.type.ts";

// Lignes écrites par citadel : « 2026-10-25 15:02:11  v2026.10.25  ok  (depuis …) ».
// La date fait 19 caractères ; le reste est montré tel quel. Plus récent en premier.
const DATE_LENGTH = 19;

export function parseDeployHistory(
	content: string,
	limit: number,
): DeployHistoryEntry[] {
	return content
		.split("\n")
		.filter((line) => line.trim().length > DATE_LENGTH)
		.slice(-limit)
		.reverse()
		.map((line) => ({
			date: line.slice(0, DATE_LENGTH),
			text: line.slice(DATE_LENGTH).trim().replaceAll("  ", " · "),
		}));
}
