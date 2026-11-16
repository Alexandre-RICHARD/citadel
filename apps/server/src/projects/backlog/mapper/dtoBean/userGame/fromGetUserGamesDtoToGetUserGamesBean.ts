import type { GetUserGamesQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesQueryParamDto.type.ts";
import { gameColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/gameColumnFilterKinds.ts";
import { readViewParams } from "@citadel/specs/src/projects/backlog/helper/view/readViewParams.ts";

import type { GetUserGamesBean } from "../../../bean/getUserGamesBean.type.ts";
import { readQueryParam } from "../common/readQueryParam.ts";

// Le schéma a déjà vérifié chaque paramètre : ils se lisent tous
export function fromGetUserGamesDtoToGetUserGamesBean(
	queryParamDto: GetUserGamesQueryParamDto,
): GetUserGamesBean {
	return {
		page: queryParamDto.page,
		...readViewParams(gameColumnFilterKinds, (name) =>
			readQueryParam(queryParamDto, name),
		),
	};
}
