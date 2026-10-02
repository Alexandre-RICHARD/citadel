import { mapStringToDate } from "@citadel/common/src/universal/date/mapStringToDate.ts";
import type { UpdateDeathBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathBodyDto.ts";
import type { UpdateDeathPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathPathParamDto.ts";

import type { UpdateDeathBean } from "../../../bean/updateDeathBean.ts";

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
