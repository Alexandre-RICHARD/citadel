import type { GetOneGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGamePathParamDto.ts";

import type { GetOneGameBean } from "../../../bean/getOneGameBean.ts";

export function fromGetOneGameDtoToGetOneGameBean(
	getOneGamePathParamDto: GetOneGamePathParamDto,
): GetOneGameBean {
	const getOneGameBean = {
		id: getOneGamePathParamDto.id,
	};
	return getOneGameBean;
}
