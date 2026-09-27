import type { GetOneBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBossPathParam.dto.ts";

import type { GetOneBossBean } from "../../../bean/getOneBoss.bean.ts";

export function fromGetOneBossDtoToGetOneBossBean(
	getOneBossPathParamDto: GetOneBossPathParamDto,
): GetOneBossBean {
	const getOneBossBean = {
		id: getOneBossPathParamDto.id,
	};
	return getOneBossBean;
}
