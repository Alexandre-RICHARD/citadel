import type { DeleteGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGamePathParamDto.ts";

import type { DeleteGameBean } from "../../../bean/deleteGameBean.ts";

export function fromDeleteGameDtoToDeleteGameBean(
	deleteGamePathParamDto: DeleteGamePathParamDto,
): DeleteGameBean {
	const deleteGameBean = {
		id: deleteGamePathParamDto.id,
	};
	return deleteGameBean;
}
