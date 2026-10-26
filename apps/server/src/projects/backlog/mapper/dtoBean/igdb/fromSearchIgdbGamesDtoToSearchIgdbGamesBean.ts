import type { SearchIgdbGamesQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/igdb/searchIgdbGames/searchIgdbGamesQueryParamDto.type.ts";

import type { SearchIgdbGamesBean } from "../../../bean/searchIgdbGamesBean.type.ts";

export function fromSearchIgdbGamesDtoToSearchIgdbGamesBean(
	queryParamDto: SearchIgdbGamesQueryParamDto,
): SearchIgdbGamesBean {
	return { query: queryParamDto.query };
}
