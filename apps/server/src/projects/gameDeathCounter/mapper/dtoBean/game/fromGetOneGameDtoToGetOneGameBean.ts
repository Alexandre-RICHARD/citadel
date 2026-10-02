import type { GetOneGamePathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGamePathParamDto.type.ts";

import type { GetOneGameBean } from "../../../bean/getOneGameBean.type.ts";

export function fromGetOneGameDtoToGetOneGameBean(
	getOneGamePathParamDto: GetOneGamePathParamDto,
): GetOneGameBean {
	const getOneGameBean = {
		id: getOneGamePathParamDto.id,
	};
	return getOneGameBean;
}
