import type { DeathBean } from "../../../bean/deathBean.ts";
import type { Death } from "../../../models/Death.ts";

export function fromDeathEntityToDeathBean(death: Death): DeathBean {
	const deathBean = {
		id: death.id,
		bossId: death.bossId,
		date: death.date,
		comment: death.comment,
	};
	return deathBean;
}
