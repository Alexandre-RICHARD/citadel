import { dateNow } from "../../../common/date/dateNow.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { AddDeathBean } from "../bean/addDeath.bean.ts";
import type { DeathBean } from "../bean/death.bean.ts";
import type { DeleteDeathBean } from "../bean/deleteDeath.bean.ts";
import type { UpdateDeathBean } from "../bean/updateDeath.bean.ts";
import { fromDeathEntityToDeathBean } from "../mapper/beanEntity/death/fromDeathEntityToDeathBean.ts";
import { addDeathQuery } from "../query/death/addDeath.query.ts";
import { deleteDeathQuery } from "../query/death/deleteDeath.query.ts";
import { updateDeathQuery } from "../query/death/updateDeath.query.ts";

export class DeathService {
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
