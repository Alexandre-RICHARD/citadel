import type { IgdbVersionGame } from "../../igdb/type/igdbVersionGame.type.ts";

// Première sortie d'une version, toutes plateformes confondues ; sans date connue, après toutes les autres
export function getIgdbFirstReleaseTime(version: IgdbVersionGame): number {
	const dates = (version.release_dates ?? []).flatMap(({ date }) =>
		date === undefined ? [] : [date],
	);
	return dates.length === 0 ? Number.MAX_SAFE_INTEGER : Math.min(...dates);
}
