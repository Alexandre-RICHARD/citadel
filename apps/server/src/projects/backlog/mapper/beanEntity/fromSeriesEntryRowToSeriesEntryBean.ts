import type { SeriesEntryBean } from "../../bean/seriesEntryBean.type.ts";
import type { SeriesEntryRow } from "../../dbType/seriesEntryRow.type.ts";

export function fromSeriesEntryRowToSeriesEntryBean(
	row: SeriesEntryRow,
): SeriesEntryBean {
	return {
		gameId: row.gameId,
		seriesNumber: Number(row.seriesNumber),
		name: row.name,
		frenchName: row.frenchName,
		firstReleaseDate: row.firstReleaseDate,
	};
}
