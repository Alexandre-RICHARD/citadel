import { dateNow } from "@citadel/common/src/universal/date/dateNow.ts";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { AddDeathBean } from "../bean/addDeathBean.type.ts";
import type { DeathBean } from "../bean/deathBean.type.ts";
import type { DeleteDeathBean } from "../bean/deleteDeathBean.type.ts";
import type { UpdateDeathBean } from "../bean/updateDeathBean.type.ts";
import { fromDeathEntityToDeathBean } from "../mapper/beanEntity/death/fromDeathEntityToDeathBean.ts";
import { addDeathQuery } from "../query/death/addDeathQuery.ts";
import { deleteDeathQuery } from "../query/death/deleteDeathQuery.ts";
import { updateDeathQuery } from "../query/death/updateDeathQuery.ts";

class DeathService {
	async addDeath(addDeathBean: AddDeathBean): Promise<DeathBean> {
		const deathEntity = await addDeathQuery(addDeathBean.bossId, dateNow());
		if (deathEntity === null)
			throw new NotFoundError(`No boss with id : ${addDeathBean.bossId}`);

		return fromDeathEntityToDeathBean(deathEntity);
	}

	async updateDeath(updateDeathBean: UpdateDeathBean): Promise<DeathBean> {
		const deathEntity = await updateDeathQuery(updateDeathBean);
		if (deathEntity === null)
			throw new NotFoundError(`No death with id : ${updateDeathBean.id}`);

		return fromDeathEntityToDeathBean(deathEntity);
	}

	async deleteDeath(deleteDeathBean: DeleteDeathBean): Promise<void> {
		const wasDeleted = await deleteDeathQuery(deleteDeathBean.id);
		if (!wasDeleted)
			throw new NotFoundError(`No death with id : ${deleteDeathBean.id}`);
	}
}

export const deathService = new DeathService();
