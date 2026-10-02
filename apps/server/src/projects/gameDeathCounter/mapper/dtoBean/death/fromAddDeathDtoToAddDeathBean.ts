import type { AddDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathPathParamDto.ts";

import type { AddDeathBean } from "../../../bean/addDeathBean.ts";

export function fromAddDeathDtoToAddDeathBean(
	addDeathPathParamDto: AddDeathPathParamDto,
): AddDeathBean {
	const addDeathBean = {
		bossId: addDeathPathParamDto.bossId,
	};
	return addDeathBean;
}
