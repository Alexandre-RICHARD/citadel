import type { SetGameFinishedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedBody.dto.ts";
import type { SetGameFinishedPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedPathParam.dto.ts";

import type { SetGameFinishedBean } from "../../../bean/setGameFinished.bean.ts";

export function fromSetGameFinishedDtoToSetGameFinishedBean(
	setGameFinishedPathParamDto: SetGameFinishedPathParamDto,
	setGameFinishedBodyDto: SetGameFinishedBodyDto,
): SetGameFinishedBean {
	const setGameFinishedBean = {
		id: setGameFinishedPathParamDto.id,
		finished: setGameFinishedBodyDto.finished,
	};
	return setGameFinishedBean;
}
