import { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";
import { columnFilterKinds } from "./columnFilterKinds.ts";
import type { SortCriterion } from "./sortCriterion.type.ts";
import { ViewParamSyntaxEnum } from "./viewParamSyntax.enum.ts";

function isEnumValue<Value extends string>(
	enumObject: Record<string, Value>,
	value: string | undefined,
): value is Value {
	return Object.values<string>(enumObject).includes(value ?? "");
}

/**
 * `releaseDate:desc,name:asc` → critères de tri ; une chaîne vide n'en donne aucun. `null` si un critère est illisible,
 * porte sur une colonne qui ne se trie pas, ou répète une colonne
 */
export function parseSortParam(text: string): SortCriterion[] | null {
	if (text === "") return [];

	const criteria: SortCriterion[] = [];
	for (const part of text.split(ViewParamSyntaxEnum.SORT_SEPARATOR)) {
		const [column, direction, ...extra] = part.split(
			ViewParamSyntaxEnum.SORT_DIRECTION_SEPARATOR,
		);
		if (
			extra.length > 0 ||
			!isEnumValue(BacklogColumnEnum, column) ||
			!isEnumValue(SortDirectionEnum, direction) ||
			columnFilterKinds[column] === null ||
			criteria.some((criterion) => criterion.column === column)
		)
			return null;
		criteria.push({ column, direction });
	}
	return criteria;
}
