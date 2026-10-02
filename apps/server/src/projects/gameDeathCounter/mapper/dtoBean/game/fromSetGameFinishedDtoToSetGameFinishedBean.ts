import type { SetGameFinishedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedBodyDto.ts";
import type { SetGameFinishedPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedPathParamDto.ts";

import type { SetGameFinishedBean } from "../../../bean/setGameFinishedBean.ts";

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
