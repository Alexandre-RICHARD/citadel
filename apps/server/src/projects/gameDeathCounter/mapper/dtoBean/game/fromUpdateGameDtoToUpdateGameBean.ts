import type { UpdateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGameBodyDto.ts";
import type { UpdateGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGamePathParamDto.ts";

import type { UpdateGameBean } from "../../../bean/updateGameBean.ts";

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
