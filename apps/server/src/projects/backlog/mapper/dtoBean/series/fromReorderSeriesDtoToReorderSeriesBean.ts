import type { ReorderSeriesBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesBodyDto.type.ts";
import type { ReorderSeriesPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesPathParamDto.type.ts";

import type { ReorderSeriesBean } from "../../../bean/reorderSeriesBean.type.ts";

export function fromReorderSeriesDtoToReorderSeriesBean(
	pathParamDto: ReorderSeriesPathParamDto,
	bodyDto: ReorderSeriesBodyDto,
): ReorderSeriesBean {
	return {
		seriesId: pathParamDto.seriesId,
		entries: bodyDto.entries.map(({ gameId, seriesNumber }) => ({
			gameId,
			seriesNumber,
		})),
	};
}
