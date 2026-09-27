import { getEarliestDate } from "../../../../../common/date/getEarliestDate.ts";
import { getLatestDate } from "../../../../../common/date/getLatestDate.ts";
import type { BossSummaryBean } from "../../../bean/bossSummary.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.row.ts";
import type { Boss } from "../../../models/Boss.ts";

/**
 * @param bossDeathDateRange `null` si le boss n'a aucune mort
 */
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
