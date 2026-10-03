import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type";

import { isTemporaryId } from "../../../../common/api/mutation/isTemporaryId";
import type { DeathFm } from "./deathFm.type";

export function fromDeathDtoToDeathFm(death: DeathDto): DeathFm {
	return {
		id: death.id,
		date: death.date,
		comment: death.comment,
		isTemporary: isTemporaryId(death.id),
	};
}
