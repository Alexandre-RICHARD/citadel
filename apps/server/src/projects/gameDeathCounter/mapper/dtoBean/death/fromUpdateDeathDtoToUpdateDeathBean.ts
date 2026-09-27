import type { UpdateDeathBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathBody.dto.ts";
import type { UpdateDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathPathParam.dto.ts";

import { mapStringToDate } from "../../../../../common/date/mapStringToDate.ts";
import type { UpdateDeathBean } from "../../../bean/updateDeath.bean.ts";

export function fromUpdateDeathDtoToUpdateDeathBean(
	updateDeathPathParamDto: UpdateDeathPathParamDto,
	updateDeathBodyDto: UpdateDeathBodyDto,
): UpdateDeathBean {
	const updateDeathBean = {
		id: updateDeathPathParamDto.id,
		date:
			updateDeathBodyDto.date === undefined
				? undefined
				: mapStringToDate(updateDeathBodyDto.date),
		comment: updateDeathBodyDto.comment,
	};
	return updateDeathBean;
}
