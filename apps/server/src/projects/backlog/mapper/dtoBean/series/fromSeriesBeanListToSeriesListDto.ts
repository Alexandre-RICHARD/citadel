import type { SeriesListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesListDto.type.ts";

import type { SeriesBean } from "../../../bean/seriesBean.type.ts";

export function fromSeriesBeanListToSeriesListDto(
	series: SeriesBean[],
): SeriesListDto {
	return { series: series.map(({ id, name }) => ({ id, name })) };
}
