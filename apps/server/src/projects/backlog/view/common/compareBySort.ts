import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

type SortValue = string | number | null;

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

/**
 * Compare deux lignes sur les critères du tri, par priorité. `getSortValue` : la valeur de tri d'une ligne dans une
 * colonne. Les cases vides passent en dernier, quel que soit le sens
 */
export function compareBySort<Row, Column extends string>(
	sort: SortCriterion<Column>[],
	first: Row,
	second: Row,
	getSortValue: (column: Column, row: Row) => SortValue,
): number {
	for (const { column, direction } of sort) {
		const firstValue = getSortValue(column, first);
		const secondValue = getSortValue(column, second);
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
