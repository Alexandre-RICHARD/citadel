import { formatFilterParam } from "@citadel/specs/src/projects/backlog/rule/view/formatFilterParam";
import { formatSortParam } from "@citadel/specs/src/projects/backlog/rule/view/formatSortParam";
import { ViewParamSyntaxEnum } from "@citadel/specs/src/projects/backlog/rule/view/viewParamSyntax.enum";

import type { BacklogView } from "./backlogView.type";

/**
 * Tri et filtres en paramètres : ceux de l'URL de la page, et ceux de la query du tableau (même écriture).
 * Le tri n'y est que s'il y en a un ; l'ordre suit les filtres, pour une clé de cache stable
 */
export function buildViewParams({
	sort,
	filters,
}: BacklogView): Record<string, string> {
	return Object.fromEntries([
		...(sort.length === 0
			? []
			: [[ViewParamSyntaxEnum.SORT_PARAM, formatSortParam(sort)]]),
		...filters
			.toSorted((first, second) => first.column.localeCompare(second.column))
			.map((filter) => [filter.column, formatFilterParam(filter)]),
	]) as Record<string, string>;
}
