import type { DeleteDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeathPathParamDto.ts";

import type { DeleteDeathBean } from "../../../bean/deleteDeathBean.ts";

export function fromDeleteDeathDtoToDeleteDeathBean(
	deleteDeathPathParamDto: DeleteDeathPathParamDto,
): DeleteDeathBean {
	const deleteDeathBean = {
		id: deleteDeathPathParamDto.id,
	};
	return deleteDeathBean;
}
