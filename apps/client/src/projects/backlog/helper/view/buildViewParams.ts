import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import { formatFilterParam } from "@citadel/specs/src/projects/backlog/helper/view/formatFilterParam";
import { formatSortParam } from "@citadel/specs/src/projects/backlog/helper/view/formatSortParam";
import { ViewParamSyntaxEnum } from "@citadel/specs/src/projects/backlog/helper/view/viewParamSyntax.enum";

import type { BacklogView } from "./backlogView.type";

/**
 * Tri et filtres en paramètres : ceux de l'URL de la page, et ceux de la query du tableau (même écriture).
 * Le tri n'y est que s'il y en a un, la combinaison des filtres que si elle est « ou » ; l'ordre suit les filtres, pour une clé de cache stable
 */
export function buildViewParams({
	sort,
	filters,
	filterMode,
}: BacklogView): Record<string, string> {
	return Object.fromEntries([
		...(sort.length === 0
			? []
			: [[ViewParamSyntaxEnum.SORT_PARAM, formatSortParam(sort)]]),
		...(filterMode === FilterModeEnum.OR
			? [[ViewParamSyntaxEnum.FILTER_MODE_PARAM, filterMode]]
			: []),
		...filters
			.toSorted((first, second) => first.column.localeCompare(second.column))
			.map((filter) => [filter.column, formatFilterParam(filter)]),
	]) as Record<string, string>;
}
