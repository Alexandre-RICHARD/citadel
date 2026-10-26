import { getSubPart } from "./getSubPart.ts";
import { hasMain } from "./hasMain.ts";
import { insertSub } from "./insertSub.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { shiftFamilies } from "./shiftFamilies.ts";

/**
 * Range un jeu principal et ses sous-jeux à la famille `family` (cahier des charges, §8). Un principal déjà là est décalé
 * avec sa famille, vers le haut (`direction` 1) ou le bas (-1). Les sous-jeux gardent leur rang ; des sous-jeux orphelins
 * déjà là restent et l'accueillent
 */
export function insertFamily(
	entries: SeriesEntry[],
	block: SeriesEntry[],
	family: number,
	direction: 1 | -1,
): SeriesEntry[] | null {
	const [head, ...subs] = block;
	if (head === undefined) return entries;

	let placed: SeriesEntry[] | null = [
		...(hasMain(entries, family)
			? shiftFamilies(entries, family, direction)
			: entries),
		{ gameId: head.gameId, seriesNumber: family },
	];
	for (const { gameId, seriesNumber } of subs)
		placed =
			placed === null
				? null
				: insertSub(placed, gameId, family, getSubPart(seriesNumber), 1);
	return placed;
}
