import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { BossBean } from "../bean/boss.bean.ts";
import type { BossSummaryBean } from "../bean/bossSummary.bean.ts";
import type { CreateBossBean } from "../bean/createBoss.bean.ts";
import type { DeleteBossBean } from "../bean/deleteBoss.bean.ts";
import type { GetOneBossBean } from "../bean/getOneBoss.bean.ts";
import type { UpdateBossBean } from "../bean/updateBoss.bean.ts";
import { fromBossEntityToBossBean } from "../mapper/beanEntity/boss/fromBossEntityToBossBean.ts";
import { fromBossEntityToBossSummaryBean } from "../mapper/beanEntity/boss/fromBossEntityToBossSummaryBean.ts";
import { createBossQuery } from "../query/boss/createBoss.query.ts";
import { deleteBossQuery } from "../query/boss/deleteBoss.query.ts";
import { getBossWithDeathsByIdQuery } from "../query/boss/getBossWithDeathsById.query.ts";
import { updateBossQuery } from "../query/boss/updateBoss.query.ts";
import { gameExistsByIdQuery } from "../query/game/gameExistsById.query.ts";
import { getBossesDeathDateRangeQuery } from "../query/game/getBossesDeathDateRange.query.ts";

export class BossService {
	async getOneBoss(getOneBossBean: GetOneBossBean): Promise<BossBean> {
		const bossEntity = await getBossWithDeathsByIdQuery(getOneBossBean.id);
		if (bossEntity === null)
			throw new NotFoundError(`No boss with id : ${getOneBossBean.id}`);

		return fromBossEntityToBossBean(bossEntity);
	}

	async createBoss(createBossBean: CreateBossBean): Promise<BossSummaryBean> {
		const gameExists = await gameExistsByIdQuery(createBossBean.gameId);

		if (!gameExists)
			throw new NotFoundError(`No game with id : ${createBossBean.gameId}`);

		const bossEntity = await createBossQuery(createBossBean);

		return fromBossEntityToBossSummaryBean(bossEntity, null);
	}

	async updateBoss(updateBossBean: UpdateBossBean): Promise<BossSummaryBean> {
		const gameExists = await gameExistsByIdQuery(updateBossBean.gameId);
		if (!gameExists)
			throw new NotFoundError(`No game with id : ${updateBossBean.gameId}`);

		const bossEntity = await updateBossQuery(updateBossBean);
		if (bossEntity === null)
			throw new NotFoundError(`No boss with id : ${updateBossBean.id}`);

		const deathDateRanges = await getBossesDeathDateRangeQuery([bossEntity.id]);
		const bossDeathDateRange = deathDateRanges.at(0) ?? null;

		return fromBossEntityToBossSummaryBean(bossEntity, bossDeathDateRange);
	}

	async deleteBoss(deleteBossBean: DeleteBossBean): Promise<void> {
		const wasDeleted = await deleteBossQuery(deleteBossBean.id);
		if (!wasDeleted)
			throw new NotFoundError(`No boss with id : ${deleteBossBean.id}`);
	}
}

export const bossService = new BossService();
