import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";

import { matchesColumnFilter } from "./common/matchesColumnFilter.ts";
import { getColumnValue } from "./getColumnValue.ts";
import type { UserGameView } from "./userGameView.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

// Textes cherchés par un filtre « contient » : le nom VF, VO et le titre de version pour la colonne Nom
function getColumnTexts(column: BacklogColumnEnum, row: ViewRow): string[] {
	const texts =
		column === BacklogColumnEnum.NAME
			? [row.frenchName, row.name, row.versionTitle]
			: [getColumnValue(column, row)];
	return texts.filter((text) => typeof text === "string");
}

function matchesFilter(row: ViewRow, filter: ColumnFilter): boolean {
	return matchesColumnFilter(
		filter,
		getColumnValue(filter.column, row),
		getColumnTexts(filter.column, row),
	);
}

/**
 * Un jeu reste affiché si sa ligne, ou au moins une de ses versions jouées, correspond à tous les filtres (et), ou à au
 * moins un (ou) : Plateforme = PS4 garde les jeux qui ont une version jouée sur PS4
 */
export function filterUserGameViews(
	views: UserGameView[],
	filters: ColumnFilter[],
	filterMode: FilterModeEnum,
): UserGameView[] {
	if (filters.length === 0) return views;

	return views.filter(({ row, userVersionRows }) =>
		[row, ...userVersionRows].some((candidate) =>
			filterMode === FilterModeEnum.AND
				? filters.every((filter) => matchesFilter(candidate, filter))
				: filters.some((filter) => matchesFilter(candidate, filter)),
		),
	);
}
