import type { GetUserGamesQueryParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesQueryParamDto.type.ts";
import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { parseFilterParam } from "@citadel/specs/src/projects/backlog/rule/view/parseFilterParam.ts";
import { parseSortParam } from "@citadel/specs/src/projects/backlog/rule/view/parseSortParam.ts";

import type { GetUserGamesBean } from "../../../bean/getUserGamesBean.type.ts";

// Le schéma a déjà vérifié chaque paramètre : ils se lisent tous
export function fromGetUserGamesDtoToGetUserGamesBean(
	queryParamDto: GetUserGamesQueryParamDto,
): GetUserGamesBean {
	return {
		page: queryParamDto.page,
		sort: parseSortParam(queryParamDto.sort) ?? [],
		filters: Object.values(BacklogColumnEnum).flatMap((column) => {
			const text: unknown = (queryParamDto as Record<string, unknown>)[column];
			const filter =
				typeof text === "string" ? parseFilterParam(column, text) : null;
			return filter === null ? [] : [filter];
		}),
	};
}
