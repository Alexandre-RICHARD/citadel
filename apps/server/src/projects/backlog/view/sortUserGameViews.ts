import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

import { compareBySort } from "./common/compareBySort.ts";
import { getColumnValue } from "./getColumnValue.ts";
import type { UserGameView } from "./userGameView.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

const STATUS_ORDER: string[] = Object.values(StatusEnum);
const ENDING_TYPE_ORDER: string[] = Object.values(EndingTypeEnum);

// Valeur de tri : statuts et types de fin dans leur ordre de définition, cases à cocher en 0 ou 1
function getSortValue(
	column: BacklogColumnEnum,
	row: ViewRow,
): string | number | null {
	if (column === BacklogColumnEnum.STATUS)
		return row.status === null ? null : STATUS_ORDER.indexOf(row.status);
	if (column === BacklogColumnEnum.ENDING_TYPE)
		return row.endingType === null
			? null
			: ENDING_TYPE_ORDER.indexOf(row.endingType);
	const value = getColumnValue(column, row);
	return typeof value === "boolean" ? Number(value) : value;
}

// Tri multi-colonnes sur ce qu'affichent les lignes des jeux ; sans tri, le jeu touché en dernier passe en premier
export function sortUserGameViews(
	views: UserGameView[],
	sort: SortCriterion[],
): UserGameView[] {
	if (sort.length === 0)
		return views.toSorted(
			(first, second) =>
				second.userGame.lastActivityAt.getTime() -
				first.userGame.lastActivityAt.getTime(),
		);
	return views.toSorted((first, second) =>
		compareBySort(sort, first.row, second.row, getSortValue),
	);
}
