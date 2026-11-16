import { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";
import type { ColumnFilterKinds } from "./columnFilterKinds.type.ts";
import type { SortCriterion } from "./sortCriterion.type.ts";
import { ViewParamSyntaxEnum } from "./viewParamSyntax.enum.ts";

function isSortDirection(
	value: string | undefined,
): value is SortDirectionEnum {
	return Object.values<string>(SortDirectionEnum).includes(value ?? "");
}

// Une colonne du tableau qui se trie : elle a un filtre
function isSortableColumn<Column extends string>(
	kinds: ColumnFilterKinds<Column>,
	column: string | undefined,
): column is Column {
	return (
		column !== undefined &&
		Object.hasOwn(kinds, column) &&
		kinds[column as Column] !== null
	);
}

/**
 * `releaseDate:desc,name:asc` → critères de tri ; une chaîne vide n'en donne aucun. `kinds` : la sorte de filtre de chaque
 * colonne du tableau. `null` si un critère est illisible, porte sur une colonne qui ne se trie pas, ou répète une colonne
 */
export function parseSortParam<Column extends string>(
	kinds: ColumnFilterKinds<Column>,
	text: string,
): SortCriterion<Column>[] | null {
	if (text === "") return [];

	const criteria: SortCriterion<Column>[] = [];
	for (const part of text.split(ViewParamSyntaxEnum.SORT_SEPARATOR)) {
		const [column, direction, ...extra] = part.split(
			ViewParamSyntaxEnum.SORT_DIRECTION_SEPARATOR,
		);
		if (
			extra.length > 0 ||
			!isSortableColumn(kinds, column) ||
			!isSortDirection(direction) ||
			criteria.some((criterion) => criterion.column === column)
		)
			return null;
		criteria.push({ column, direction });
	}
	return criteria;
}
