import type { SeriesEntryListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesEntryListDto.type.ts";

import type { SeriesEntryBean } from "../../../bean/seriesEntryBean.type.ts";

export function fromSeriesEntryBeanListToSeriesEntryListDto(
	entries: SeriesEntryBean[],
): SeriesEntryListDto {
	return {
		entries: entries.map((entry) => ({
			gameId: entry.gameId,
			seriesNumber: entry.seriesNumber,
			name: entry.name,
			frenchName: entry.frenchName,
			firstReleaseDate: entry.firstReleaseDate,
		})),
	};
}
