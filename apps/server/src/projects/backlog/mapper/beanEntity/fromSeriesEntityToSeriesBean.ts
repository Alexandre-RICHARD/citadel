import type { SeriesBean } from "../../bean/seriesBean.type.ts";
import type { Series } from "../../models/Series.ts";

export function fromSeriesEntityToSeriesBean(
	series: Series | null,
): SeriesBean | null {
	return series === null ? null : { id: series.id, name: series.name };
}
