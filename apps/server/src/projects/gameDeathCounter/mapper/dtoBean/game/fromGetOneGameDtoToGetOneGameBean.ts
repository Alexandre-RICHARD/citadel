import type { GetOneGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGamePathParam.dto.ts";

import type { GetOneGameBean } from "../../../bean/getOneGame.bean.ts";

export function fromGetOneGameDtoToGetOneGameBean(
	getOneGamePathParamDto: GetOneGamePathParamDto,
): GetOneGameBean {
	const getOneGameBean = {
		id: getOneGamePathParamDto.id,
	};
	return getOneGameBean;
}
