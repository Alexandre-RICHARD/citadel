import { dateNow } from "@citadel/common/src/universal/date/dateNow.ts";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { BossBean } from "../bean/bossBean.type.ts";
import type { BossSummaryBean } from "../bean/bossSummaryBean.type.ts";
import type { CreateBossBean } from "../bean/createBossBean.type.ts";
import type { DeleteBossBean } from "../bean/deleteBossBean.type.ts";
import type { GetOneBossBean } from "../bean/getOneBossBean.type.ts";
import type { SetBossDefeatedBean } from "../bean/setBossDefeatedBean.type.ts";
import type { UpdateBossBean } from "../bean/updateBossBean.type.ts";
import { fromBossEntityToBossBean } from "../mapper/beanEntity/boss/fromBossEntityToBossBean.ts";
import { fromBossEntityToBossSummaryBean } from "../mapper/beanEntity/boss/fromBossEntityToBossSummaryBean.ts";
import { createBossQuery } from "../query/boss/createBossQuery.ts";
import { deleteBossQuery } from "../query/boss/deleteBossQuery.ts";
import { getBossesDeathDateRangeQuery } from "../query/boss/getBossesDeathDateRangeQuery.ts";
import { getBossWithDeathsByIdQuery } from "../query/boss/getBossWithDeathsByIdQuery.ts";
import { updateBossQuery } from "../query/boss/updateBossQuery.ts";
import { updateBossDefeatedAtQuery } from "../query/boss/updateBossDefeatedAtQuery.ts";
import { gameExistsByIdQuery } from "../query/game/gameExistsByIdQuery.ts";

class BossService {
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

	async setBossDefeated(
		setBossDefeatedBean: SetBossDefeatedBean,
	): Promise<BossSummaryBean> {
		const defeatedAt = setBossDefeatedBean.defeated ? dateNow() : null;

		const bossEntity = await updateBossDefeatedAtQuery(
			setBossDefeatedBean.id,
			defeatedAt,
		);
		if (bossEntity === null)
			throw new NotFoundError(`No boss with id : ${setBossDefeatedBean.id}`);

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
