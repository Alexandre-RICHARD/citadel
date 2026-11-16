import type { GetAllUserMediaQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getAllUserMedia/getAllUserMediaQueryParamDto.type";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import { formatFilterParam } from "@citadel/specs/src/projects/backlog/helper/view/formatFilterParam";
import { formatSortParam } from "@citadel/specs/src/projects/backlog/helper/view/formatSortParam";

import type { BacklogView } from "../../helper/view/backlogView.type";

// Query du tableau des films et séries : la même écriture que l'URL de la page, plus le numéro de page
export function buildUserMediaQueryParams(
	{ sort, filters, filterMode }: BacklogView<ConnectedMediaColumn>,
	page: number,
): GetAllUserMediaQueryParamDto {
	return {
		page,
		sort: formatSortParam(sort),
		filterMode,
		...Object.fromEntries(
			filters.map((filter) => [filter.column, formatFilterParam(filter)]),
		),
	};
}
