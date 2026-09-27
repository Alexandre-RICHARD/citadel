import type { DeleteDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeathPathParam.dto.ts";

import type { DeleteDeathBean } from "../../../bean/deleteDeath.bean.ts";

export function fromDeleteDeathDtoToDeleteDeathBean(
	deleteDeathPathParamDto: DeleteDeathPathParamDto,
): DeleteDeathBean {
	const deleteDeathBean = {
		id: deleteDeathPathParamDto.id,
	};
	return deleteDeathBean;
}
