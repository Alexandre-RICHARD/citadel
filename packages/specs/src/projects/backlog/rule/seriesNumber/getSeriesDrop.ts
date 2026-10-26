import { getFamily } from "./getFamily.ts";
import { getSeriesBlock } from "./getSeriesBlock.ts";
import { getSubPart } from "./getSubPart.ts";
import type { SeriesDrop } from "./seriesDrop.type.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

/**
 * Le trait de dépôt (cahier des charges, §8) : `gapIndex`, sa place entre deux lignes (0 : tout en haut), et `wantsSub`,
 * le glisser décalé à droite. Tout en haut, le jeu est principal ; entre deux jeux d'une même famille, sous-jeu ; ailleurs,
 * selon `wantsSub`
 */
export function getSeriesDrop(
	entries: SeriesEntry[],
	gameId: number,
	gapIndex: number,
	wantsSub: boolean,
): SeriesDrop {
	const block = getSeriesBlock(entries, gameId);
	const blockIds = new Set(block.map((entry) => entry.gameId));
	const rest = entries.filter((entry) => !blockIds.has(entry.gameId));
	const restGapIndex = entries
		.slice(0, gapIndex)
		.filter((entry) => !blockIds.has(entry.gameId)).length;
	const above = restGapIndex === 0 ? null : (rest.at(restGapIndex - 1) ?? null);
	const below = rest.at(restGapIndex) ?? null;
	const isInsideFamily =
		above !== null &&
		below !== null &&
		getFamily(above.seriesNumber) === getFamily(below.seriesNumber) &&
		getSubPart(below.seriesNumber) > 0;

	return {
		block,
		rest,
		above,
		isSub: above !== null && (isInsideFamily || wantsSub),
		isMovingDown:
			entries.findIndex((entry) => entry.gameId === gameId) < gapIndex,
	};
}
