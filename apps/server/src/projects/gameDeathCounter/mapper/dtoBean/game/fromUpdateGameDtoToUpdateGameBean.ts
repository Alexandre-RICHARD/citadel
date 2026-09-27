import type { UpdateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGameBody.dto.ts";
import type { UpdateGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGamePathParam.dto.ts";

import type { UpdateGameBean } from "../../../bean/updateGame.bean.ts";

export function fromUpdateGameDtoToUpdateGameBean(
	updateGamePathParamDto: UpdateGamePathParamDto,
	updateGameBodyDto: UpdateGameBodyDto,
): UpdateGameBean {
	const updateGameBean = {
		id: updateGamePathParamDto.id,
		name: updateGameBodyDto.name,
	};
	return updateGameBean;
}
