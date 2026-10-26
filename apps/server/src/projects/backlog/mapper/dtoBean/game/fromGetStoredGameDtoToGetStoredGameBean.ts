import type { GetStoredGamePathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGame/getStoredGamePathParamDto.type.ts";

import type { GetStoredGameBean } from "../../../bean/getStoredGameBean.type.ts";

export function fromGetStoredGameDtoToGetStoredGameBean(
	pathParamDto: GetStoredGamePathParamDto,
): GetStoredGameBean {
	return { gameId: pathParamDto.gameId };
}
