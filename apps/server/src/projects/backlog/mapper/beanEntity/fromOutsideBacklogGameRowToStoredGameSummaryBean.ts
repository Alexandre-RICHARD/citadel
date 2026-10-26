import type { StoredGameSummaryBean } from "../../bean/storedGameSummaryBean.type.ts";
import type { OutsideBacklogGameRow } from "../../dbType/outsideBacklogGameRow.type.ts";

const YEAR_LENGTH = "YYYY".length;

export function fromOutsideBacklogGameRowToStoredGameSummaryBean(
	row: OutsideBacklogGameRow,
	platformNames: string[],
): StoredGameSummaryBean {
	return {
		id: row.id,
		name: row.name,
		frenchName: row.frenchName,
		releaseYear:
			row.firstReleaseDate === null
				? null
				: Number(row.firstReleaseDate.slice(0, YEAR_LENGTH)),
		coverImageId: row.coverImageId,
		platformNames,
	};
}
