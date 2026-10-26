import { getFamilyDigits } from "./getFamilyDigits.ts";
import { getSubPart } from "./getSubPart.ts";
import { getSubPartStep } from "./getSubPartStep.ts";
import { insertSub } from "./insertSub.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";
import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";
import { widenFamily } from "./widenFamily.ts";

// Range un sous-jeu au rang qui suit celui de `afterGameId` (0 : son principal), en libérant ce rang vers le haut s'il est pris
export function insertSubAfter(
	entries: SeriesEntry[],
	gameId: number,
	family: number,
	afterGameId: number,
): SeriesEntry[] | null {
	const after = entries.find((entry) => entry.gameId === afterGameId);
	const afterSubPart = after === undefined ? 0 : getSubPart(after.seriesNumber);
	const subPart =
		afterSubPart + getSubPartStep(getFamilyDigits(entries, family));

	if (subPart >= Number(SeriesNumberScaleEnum.THOUSANDTHS)) {
		const widened = widenFamily(entries, family);
		return widened === null
			? null
			: insertSubAfter(widened, gameId, family, afterGameId);
	}

	return insertSub(entries, gameId, family, subPart, 1);
}
