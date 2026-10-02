import type { GetOneBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBossPathParamDto.ts";

import type { GetOneBossBean } from "../../../bean/getOneBossBean.ts";

export function fromGetOneBossDtoToGetOneBossBean(
	getOneBossPathParamDto: GetOneBossPathParamDto,
): GetOneBossBean {
	const getOneBossBean = {
		id: getOneBossPathParamDto.id,
	};
	return getOneBossBean;
}
