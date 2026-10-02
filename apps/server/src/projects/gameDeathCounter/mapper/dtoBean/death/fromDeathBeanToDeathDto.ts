import { mapDateToString } from "@citadel/common/src/universal/date/mapDateToString.ts";
import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/death.dto.ts";

import type { DeathBean } from "../../../bean/death.bean.ts";

export function fromDeathBeanToDeathDto(deathBean: DeathBean): DeathDto {
	const deathDto: DeathDto = {
		id: deathBean.id,
		date: mapDateToString(deathBean.date),
		comment: deathBean.comment,
	};
	return deathDto;
}
