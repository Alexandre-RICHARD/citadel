import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

import type { ConnectedUserMediaBean } from "../../bean/connectedUserMediaBean.type.ts";
import { compareBySort } from "../../view/common/compareBySort.ts";
import { getMediaSortValue } from "../../view/media/getMediaSortValue.ts";
import { getNasSortValue } from "./getNasSortValue.ts";
import { isNasColumn } from "./isNasColumn.ts";

function getSortValue(
	column: ConnectedMediaColumn,
	row: ConnectedUserMediaBean,
): string | number | null {
	return isNasColumn(column)
		? getNasSortValue(column, row.nas)
		: getMediaSortValue(column, row);
}

// Le tri du mode connecté ; sans tri, comme le mode classique : le média ajouté ou modifié en dernier d'abord
export function sortConnectedUserMedia(
	rows: ConnectedUserMediaBean[],
	sort: SortCriterion<ConnectedMediaColumn>[],
): ConnectedUserMediaBean[] {
	if (sort.length === 0)
		return rows.toSorted(
			(first, second) =>
				second.updatedAt.getTime() - first.updatedAt.getTime() ||
				second.id - first.id,
		);
	return rows.toSorted((first, second) =>
		compareBySort(sort, first, second, getSortValue),
	);
}
