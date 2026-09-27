import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/death.dto.ts";

import { mapDateToString } from "../../../../../common/date/mapDateToString.ts";
import type { DeathBean } from "../../../bean/death.bean.ts";

export function fromDeathBeanToDeathDto(deathBean: DeathBean): DeathDto {
	const deathDto = {
		id: deathBean.id,
		bossId: deathBean.bossId,
		date: mapDateToString(deathBean.date),
		comment: deathBean.comment,
	};
	return deathDto;
}
