import type { DeleteUserGamePathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/deleteUserGame/deleteUserGamePathParamDto.type.ts";

import type { DeleteUserGameBean } from "../../../bean/deleteUserGameBean.type.ts";

export function fromDeleteUserGameDtoToDeleteUserGameBean(
	pathParamDto: DeleteUserGamePathParamDto,
): DeleteUserGameBean {
	return { gameId: pathParamDto.gameId };
}
