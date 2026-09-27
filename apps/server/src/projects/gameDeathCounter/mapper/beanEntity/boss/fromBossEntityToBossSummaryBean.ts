import type { BossSummaryBean } from "../../../bean/bossSummary.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.entity.ts";
import type { Boss } from "../../../models/Boss.ts";

// TODO Analyse
export function fromBossEntityToBossSummaryBean(
	boss: Boss,
	deathDateRange: BossDeathDateRangeRow | null,
): BossSummaryBean {
	const candidateFirstDates = [
		deathDateRange?.firstDeathDate ?? null,
		boss.defeatedAt,
	].filter((date): date is Date => date !== null);

	const candidateLastDates = [
		deathDateRange?.lastDeathDate ?? null,
		boss.defeatedAt,
	].filter((date): date is Date => date !== null);

	const firstTry =
		candidateFirstDates.length > 0
			? new Date(Math.min(...candidateFirstDates.map((date) => date.getTime())))
			: null;

	const lastTry =
		candidateLastDates.length > 0
			? new Date(Math.max(...candidateLastDates.map((date) => date.getTime())))
			: null;

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
