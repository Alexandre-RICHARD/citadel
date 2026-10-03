import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";

import type { BossFm } from "./bossFm.type";
import { fromBossSummaryDtoToBossSummaryFm } from "./fromBossSummaryDtoToBossSummaryFm";
import { fromDeathDtoToDeathFm } from "./fromDeathDtoToDeathFm";

// Le serveur renvoie les morts de la plus ancienne à la plus récente ; l'écran montre d'abord la dernière.
// À date égale, la plus récemment créée d'abord ; une mort optimiste (id négatif) passe devant toutes
function compareNewestFirst(
	first: BossDto["deaths"][number],
	second: BossDto["deaths"][number],
): number {
	const byDate = Date.parse(second.date) - Date.parse(first.date);
	if (byDate !== 0) return byDate;
	if (first.id < 0 || second.id < 0) return first.id - second.id;
	return second.id - first.id;
}

export function fromBossDtoToBossFm(boss: BossDto): BossFm {
	return {
		...fromBossSummaryDtoToBossSummaryFm(boss),
		deaths: [...boss.deaths]
			.sort(compareNewestFirst)
			.map(fromDeathDtoToDeathFm),
	};
}
