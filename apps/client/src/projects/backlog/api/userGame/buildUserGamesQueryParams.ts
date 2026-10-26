import type { GetUserGamesQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesQueryParamDto.type";
import { formatFilterParam } from "@citadel/specs/src/projects/backlog/rule/view/formatFilterParam";
import { formatSortParam } from "@citadel/specs/src/projects/backlog/rule/view/formatSortParam";

import type { BacklogView } from "../../helper/view/backlogView.type";

// Query du tableau : la même écriture que l'URL de la page, plus le numéro de page
export function buildUserGamesQueryParams(
	{ sort, filters }: BacklogView,
	page: number,
): GetUserGamesQueryParamDto {
	return {
		page,
		sort: formatSortParam(sort),
		...Object.fromEntries(
			filters.map((filter) => [filter.column, formatFilterParam(filter)]),
		),
	};
}
