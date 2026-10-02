import { mapStringToDate } from "@citadel/common/src/universal/date/mapStringToDate.ts";
import type { UpdateDeathBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathBodyDto.type.ts";
import type { UpdateDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathPathParamDto.type.ts";

import type { UpdateDeathBean } from "../../../bean/updateDeathBean.type.ts";

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
