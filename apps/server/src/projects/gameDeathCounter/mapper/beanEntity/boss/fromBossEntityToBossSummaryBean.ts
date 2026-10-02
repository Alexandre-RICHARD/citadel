import { getEarliestDate } from "@citadel/common/src/universal/date/getEarliestDate.ts";
import { getLatestDate } from "@citadel/common/src/universal/date/getLatestDate.ts";

import type { BossSummaryBean } from "../../../bean/bossSummaryBean.type.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRangeRow.type.ts";
import type { Boss } from "../../../models/Boss.ts";

export function fromBossEntityToBossSummaryBean(
	boss: Boss,
	bossDeathDateRange: BossDeathDateRangeRow | null,
): BossSummaryBean {
	const firstDeathDate = bossDeathDateRange?.firstDeathDate ?? null;
	const lastDeathDate = bossDeathDateRange?.lastDeathDate ?? null;

	const firstTry = getEarliestDate([firstDeathDate, boss.defeatedAt]);
	const lastTry = getLatestDate([lastDeathDate, boss.defeatedAt]);

	const bossSummaryBean = {
		id: boss.id,
		gameId: boss.gameId,
		name: boss.name,
		firstTry,
		lastTry,
		defeatedAt: boss.defeatedAt,
		totalDeath: boss.totalDeath,
	};
	return bossSummaryBean;
}
