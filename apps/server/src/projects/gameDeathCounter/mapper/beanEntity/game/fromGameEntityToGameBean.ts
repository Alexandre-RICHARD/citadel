import type { GameBean } from "../../../bean/game.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.row.ts";
import type { GameWithBossesEntity } from "../../../dbType/gameWithBosses.entity.ts";
import { fromBossEntityToBossSummaryBean } from "../boss/fromBossEntityToBossSummaryBean.ts";

export function fromGameEntityToGameBean(
	game: GameWithBossesEntity,
	deathDateRangeByBossId: Map<number, BossDeathDateRangeRow>,
): GameBean {
	const bossSummaryBeans = game.bosses.map((bossEntity) => {
		const bossDeathDateRange =
			deathDateRangeByBossId.get(bossEntity.id) ?? null;
		return fromBossEntityToBossSummaryBean(bossEntity, bossDeathDateRange);
	});

	const gameTotalDeath = bossSummaryBeans.reduce(
		(totalDeath, bossSummaryBean) => totalDeath + bossSummaryBean.totalDeath,
		0,
	);

	const gameBean = {
		id: game.id,
		name: game.name,
		startedAt: game.createdAt,
		endedAt: game.endedAt,
		totalDeath: gameTotalDeath,
		bosses: bossSummaryBeans,
	};
	return gameBean;
}
