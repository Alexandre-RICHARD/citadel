import { FilterModeEnum } from "../../enum/filterMode.enum.ts";
import type { ColumnFilterKinds } from "./columnFilterKinds.type.ts";
import { parseFilterParam } from "./parseFilterParam.ts";
import { parseSortParam } from "./parseSortParam.ts";
import type { TableView } from "./tableView.type.ts";
import { ViewParamSyntaxEnum } from "./viewParamSyntax.enum.ts";

/**
 * Tri, filtres et combinaison lus dans des paramètres (URL de la page, query du serveur), écrits par buildViewParams.
 * `getParam` : la valeur d'un paramètre, null ou undefined s'il manque. Un paramètre illisible est ignoré
 */
export function readViewParams<Column extends string>(
	kinds: ColumnFilterKinds<Column>,
	getParam: (name: string) => string | null | undefined,
): TableView<Column> {
	const columns = Object.keys(kinds) as Column[];
	return {
		sort:
			parseSortParam(kinds, getParam(ViewParamSyntaxEnum.SORT_PARAM) ?? "") ??
			[],
		filterMode:
			getParam(ViewParamSyntaxEnum.FILTER_MODE_PARAM) === FilterModeEnum.OR
				? FilterModeEnum.OR
				: FilterModeEnum.AND,
		filters: columns.flatMap((column) => {
			const text = getParam(column);
			const filter =
				typeof text === "string" ? parseFilterParam(kinds, column, text) : null;
			return filter === null ? [] : [filter];
		}),
	};
}
