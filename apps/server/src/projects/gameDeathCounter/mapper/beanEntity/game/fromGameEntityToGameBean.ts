import type { GameBean } from "../../../bean/game.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.entity.ts";
import type { Game } from "../../../models/Game.ts";
import { fromBossEntityToBossSummaryBean } from "../boss/fromBossEntityToBossSummaryBean.ts";

// TODO Analyse
export function fromGameEntityToGameBean(
	game: Game,
	deathDateRangeByBossId: Map<number, BossDeathDateRangeRow>,
): GameBean {
	const bosses = game.bosses ?? [];

	const bossSummaryBeans = bosses.map((boss) =>
		fromBossEntityToBossSummaryBean(
			boss,
			deathDateRangeByBossId.get(boss.id) ?? null,
		),
	);

	const gameBean = {
		id: game.id,
		name: game.name,
		startedAt: game.createdAt,
		endedAt: game.endedAt,
		totalDeath: bossSummaryBeans.reduce(
			(sum, boss) => sum + boss.totalDeath,
			0,
		),
		bosses: bossSummaryBeans,
	};
	return gameBean;
}
