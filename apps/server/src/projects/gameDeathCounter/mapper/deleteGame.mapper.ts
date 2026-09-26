import type { DeleteGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGamePathParam.dto.ts";

import type { DeleteGameBean } from "../bean/deleteGameBean.ts";

export const deleteGameMapper = {
	fromDeleteGameDtoToDeleteGameBean: (
		deleteGamePathParamDto: DeleteGamePathParamDto,
	): DeleteGameBean => {
		const deleteGameBean = {
			id: deleteGamePathParamDto.id,
		};
		return deleteGameBean;
	},
};
