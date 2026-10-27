import { getFamily } from "./getFamily.ts";
import { getFamilyDigits } from "./getFamilyDigits.ts";
import { getSeriesDrop } from "./getSeriesDrop.ts";
import { getSubPart } from "./getSubPart.ts";
import { getSubPartStep } from "./getSubPartStep.ts";
import { hasMain } from "./hasMain.ts";
import { insertFamily } from "./insertFamily.ts";
import { insertSub } from "./insertSub.ts";
import { insertSubsAfter } from "./insertSubsAfter.ts";
import { isSubPartUsed } from "./isSubPartUsed.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";
import { sortSeriesEntries } from "./sortSeriesEntries.ts";

/**
 * Glisser-déposer de « Réorganiser la série ». Le jeu prend le premier numéro libre juste après le jeu
 * du dessus (principal : l'entier suivant sa famille, 1 tout en haut ; sous-jeu : le rang suivant), et personne d'autre ne bouge.
 * Ce numéro pris : en descendant au même niveau, le jeu prend la place du jeu du dessus et les jeux dépassés reculent d'un cran ;
 * sinon, il prend ce numéro et celui qui l'avait avance d'un cran. Dans les deux cas, en cascade, jusqu'à un trou
 */
export function dropSeriesEntry(
	entries: SeriesEntry[],
	gameId: number,
	gapIndex: number,
	wantsSub: boolean,
): SeriesEntry[] {
	const { block, rest, above, isSub, isMovingDown } = getSeriesDrop(
		entries,
		gameId,
		gapIndex,
		wantsSub,
	);
	const [head, ...subs] = block;
	if (head === undefined) return entries;

	const isMain = getSubPart(head.seriesNumber) === 0;
	let placed: SeriesEntry[] | null;
	if (above === null || !isSub) {
		const aboveFamily = above === null ? 0 : getFamily(above.seriesNumber);
		// Sans place libre, un principal qui descend prend celle de la famille du dessus, qui recule
		const isPulling =
			isMain &&
			isMovingDown &&
			hasMain(rest, aboveFamily + 1) &&
			hasMain(rest, aboveFamily);
		placed = isPulling
			? insertFamily(rest, block, aboveFamily, -1)
			: insertFamily(rest, block, aboveFamily + 1, 1);
	} else {
		const family = getFamily(above.seriesNumber);
		const nextSubPart =
			getSubPart(above.seriesNumber) +
			getSubPartStep(getFamilyDigits(rest, family));
		// Sans rang libre, un sous-jeu qui descend dans sa famille prend le rang du dessus, qui recule
		const isPulling =
			!isMain &&
			isMovingDown &&
			getFamily(head.seriesNumber) === family &&
			(nextSubPart >= Number(SeriesNumberScaleEnum.THOUSANDTHS) ||
				isSubPartUsed(rest, family, nextSubPart));
		placed = isPulling
			? insertSub(rest, head.gameId, family, getSubPart(above.seriesNumber), -1)
			: insertSubsAfter(rest, [head, ...subs], family, above.gameId);
	}
	return placed === null ? entries : sortSeriesEntries(placed);
}
