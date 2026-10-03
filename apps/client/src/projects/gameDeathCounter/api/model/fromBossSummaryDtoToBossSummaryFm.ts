import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type";

import { isTemporaryId } from "../../../../common/api/mutation/isTemporaryId";
import type { BossSummaryFm } from "./bossSummaryFm.type";

export function fromBossSummaryDtoToBossSummaryFm(
	boss: BossSummaryDto,
): BossSummaryFm {
	return {
		id: boss.id,
		name: boss.name,
		firstTry: boss.firstTry,
		lastTry: boss.lastTry,
		defeatedAt: boss.defeatedAt,
		totalDeath: boss.totalDeath,
		isDefeated: boss.defeatedAt !== null,
		isTemporary: isTemporaryId(boss.id),
	};
}
