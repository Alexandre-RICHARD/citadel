import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type.ts";

import type { ConnectedUserMediaBean } from "../../bean/connectedUserMediaBean.type.ts";
import type { ColumnValue } from "../../view/common/columnValue.type.ts";
import { matchesColumnFilter } from "../../view/common/matchesColumnFilter.ts";
import { getMediaColumnValue } from "../../view/media/getMediaColumnValue.ts";
import { getNasColumnValue } from "./getNasColumnValue.ts";
import { isNasColumn } from "./isNasColumn.ts";

function getColumnValue(
	column: ConnectedMediaColumn,
	row: ConnectedUserMediaBean,
): ColumnValue {
	return isNasColumn(column)
		? getNasColumnValue(column, row.nas)
		: getMediaColumnValue(column, row);
}

// Textes cherchés par un filtre « contient » : les deux titres ; pour les torrents, leurs noms et ceux de leurs trackers
function getColumnTexts(
	column: ConnectedMediaColumn,
	row: ConnectedUserMediaBean,
): string[] {
	if (column === MediaColumnEnum.TITLE) return [row.title, row.originalTitle];
	if (column === NasColumnEnum.TORRENTS)
		return row.nas.torrents.flatMap(({ name, trackerName }) =>
			trackerName === null ? [name] : [name, trackerName],
		);
	const value = getColumnValue(column, row);
	return typeof value === "string" ? [value] : [];
}

/**
 * Le filtre du mode connecté : celui du mode classique, colonnes du NAS comprises. Les colonnes du NAS ne lisent, elles
 * aussi, que la ligne du média (une série passe sur ses agrégats, pas sur ses épisodes)
 */
export function filterConnectedUserMedia(
	rows: ConnectedUserMediaBean[],
	filters: ColumnFilter<ConnectedMediaColumn>[],
	filterMode: FilterModeEnum,
): ConnectedUserMediaBean[] {
	if (filters.length === 0) return rows;
	function matches(
		row: ConnectedUserMediaBean,
		filter: ColumnFilter<ConnectedMediaColumn>,
	): boolean {
		return matchesColumnFilter(
			filter,
			getColumnValue(filter.column, row),
			getColumnTexts(filter.column, row),
			filterMode,
		);
	}
	return rows.filter((row) =>
		filterMode === FilterModeEnum.AND
			? filters.every((filter) => matches(row, filter))
			: filters.some((filter) => matches(row, filter)),
	);
}
