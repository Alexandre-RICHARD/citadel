import type { AddDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathPathParam.dto.ts";

import type { AddDeathBean } from "../../../bean/addDeath.bean.ts";

export function fromAddDeathDtoToAddDeathBean(
	addDeathPathParamDto: AddDeathPathParamDto,
): AddDeathBean {
	const addDeathBean = {
		bossId: addDeathPathParamDto.id,
	};
	return addDeathBean;
}
