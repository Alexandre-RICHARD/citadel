import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { BossSummaryBean } from "../bean/bossSummary.bean.ts";
import type { CreateBossBean } from "../bean/createBoss.bean.ts";
import { fromBossEntityToBossSummaryBean } from "../mapper/beanEntity/boss/fromBossEntityToBossSummaryBean.ts";
import { createBossQuery } from "../query/boss/createBoss.query.ts";
import { gameExistsByIdQuery } from "../query/game/gameExistsById.query.ts";

export class BossService {
	async createBoss(createBossBean: CreateBossBean): Promise<BossSummaryBean> {
		const gameExists = await gameExistsByIdQuery(createBossBean.gameId);

		if (!gameExists)
			throw new NotFoundError(`No game with id : ${createBossBean.gameId}`);

		const bossEntity = await createBossQuery(createBossBean);

		return fromBossEntityToBossSummaryBean(bossEntity, null);
	}
}

export const bossService = new BossService();
