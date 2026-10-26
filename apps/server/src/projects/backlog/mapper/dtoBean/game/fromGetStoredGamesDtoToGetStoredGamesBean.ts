import type { GetStoredGamesQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGames/getStoredGamesQueryParamDto.type.ts";

import type { GetStoredGamesBean } from "../../../bean/getStoredGamesBean.type.ts";

export function fromGetStoredGamesDtoToGetStoredGamesBean(
	queryParamDto: GetStoredGamesQueryParamDto,
): GetStoredGamesBean {
	return { query: queryParamDto.query, page: queryParamDto.page };
}
