import type { AddDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathPathParamDto.type.ts";

import type { AddDeathBean } from "../../../bean/addDeathBean.type.ts";

export function fromAddDeathDtoToAddDeathBean(
	addDeathPathParamDto: AddDeathPathParamDto,
): AddDeathBean {
	const addDeathBean = {
		bossId: addDeathPathParamDto.bossId,
	};
	return addDeathBean;
}
