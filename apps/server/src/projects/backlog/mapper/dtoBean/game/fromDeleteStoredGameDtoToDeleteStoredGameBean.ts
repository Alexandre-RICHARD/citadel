import type { DeleteStoredGamePathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/games/deleteStoredGame/deleteStoredGamePathParamDto.type.ts";

import type { DeleteStoredGameBean } from "../../../bean/deleteStoredGameBean.type.ts";

export function fromDeleteStoredGameDtoToDeleteStoredGameBean(
	pathParamDto: DeleteStoredGamePathParamDto,
): DeleteStoredGameBean {
	return { gameId: pathParamDto.gameId };
}
