import type { UserGameListDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameListDto.type.ts";

import type { UserGamePageBean } from "../../../bean/userGamePageBean.type.ts";
import { fromUserGameBeanToUserGameDto } from "./fromUserGameBeanToUserGameDto.ts";

export function fromUserGamePageBeanToUserGameListDto(
	page: UserGamePageBean,
): UserGameListDto {
	return {
		userGames: page.userGames.map(fromUserGameBeanToUserGameDto),
		matchedCount: page.matchedCount,
	};
}
