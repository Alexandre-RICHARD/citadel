import type { GameBean } from "../../../bean/game.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.entity.ts";
import type { Game } from "../../../models/Game.ts";
import { fromBossEntityToBossSummaryBean } from "../boss/fromBossEntityToBossSummaryBean.ts";

/**
 * @param game Doit avoir été chargé avec ses boss (`include: bosses`)
 * @param deathDateRangeByBossId Les boss sans aucune mort n'y figurent pas
 */
export function fromGameEntityToGameBean(
	game: Game,
	deathDateRangeByBossId: Map<number, BossDeathDateRangeRow>,
): GameBean {
	if (game.bosses === undefined)
		throw new Error(`Game ${game.id} was loaded without its bosses`);

	const bossEntities = game.bosses;

	const bossSummaryBeans = bossEntities.map((bossEntity) => {
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
