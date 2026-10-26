import type { GetSeriesEntriesPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/series/getSeriesEntries/getSeriesEntriesPathParamDto.type.ts";

import type { GetSeriesEntriesBean } from "../../../bean/getSeriesEntriesBean.type.ts";

export function fromGetSeriesEntriesDtoToGetSeriesEntriesBean(
	pathParamDto: GetSeriesEntriesPathParamDto,
): GetSeriesEntriesBean {
	return { seriesId: pathParamDto.seriesId };
}
