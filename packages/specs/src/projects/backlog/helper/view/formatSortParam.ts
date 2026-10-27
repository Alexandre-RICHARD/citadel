import type { SortCriterion } from "./sortCriterion.type.ts";
import { ViewParamSyntaxEnum } from "./viewParamSyntax.enum.ts";

// Critères de tri → `releaseDate:desc,name:asc` ; aucun critère → chaîne vide
export function formatSortParam(sort: SortCriterion[]): string {
	return sort
		.map(
			({ column, direction }) =>
				`${column}${ViewParamSyntaxEnum.SORT_DIRECTION_SEPARATOR}${direction}`,
		)
		.join(ViewParamSyntaxEnum.SORT_SEPARATOR);
}
