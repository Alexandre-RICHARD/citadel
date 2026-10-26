import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/rule/view/sortCriterion.type.ts";

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
		return ENDING_TYPE_ORDER.indexOf(row.endingType);
	const value = getColumnValue(column, row);
	return typeof value === "boolean" ? Number(value) : value;
}

// Textes : en français, sans tenir compte des accents ni des majuscules, les nombres dans l'ordre (« FF2 » avant « FF10 »)
function compareSortValues(
	first: string | number,
	second: string | number,
): number {
	if (typeof first === "string" && typeof second === "string")
		return first.localeCompare(second, "fr", {
			sensitivity: "base",
			numeric: true,
		});
	return Number(first) - Number(second);
}

function compareRows(
	sort: SortCriterion[],
	first: ViewRow,
	second: ViewRow,
): number {
	for (const { column, direction } of sort) {
		const firstValue = getSortValue(column, first);
		const secondValue = getSortValue(column, second);
		// Les cases vides passent en dernier, quel que soit le sens
		if (firstValue === null && secondValue !== null) return 1;
		if (firstValue !== null && secondValue === null) return -1;
		if (firstValue !== null && secondValue !== null) {
			const order = compareSortValues(firstValue, secondValue);
			if (order !== 0)
				return direction === SortDirectionEnum.ASC ? order : -order;
		}
	}
	return 0;
}

// Tri multi-colonnes sur ce qu'affichent les lignes des jeux ; sans tri, l'ordre d'ajout reste
export function sortUserGameViews(
	views: UserGameView[],
	sort: SortCriterion[],
): UserGameView[] {
	if (sort.length === 0) return views;
	return views.toSorted((first, second) =>
		compareRows(sort, first.row, second.row),
	);
}
