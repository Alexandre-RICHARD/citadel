import { getEarliestDate } from "../../../../../common/date/getEarliestDate.ts";
import { getLatestDate } from "../../../../../common/date/getLatestDate.ts";
import type { BossBean } from "../../../bean/boss.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.entity.ts";
import type { Boss } from "../../../models/Boss.ts";
import { fromDeathEntityToDeathBean } from "../death/fromDeathEntityToDeathBean.ts";
import { fromBossEntityToBossSummaryBean } from "./fromBossEntityToBossSummaryBean.ts";

/**
 * @param boss Doit avoir été chargé avec ses morts (`include: deaths`)
 */
export function fromBossEntityToBossBean(boss: Boss): BossBean {
	if (boss.deaths === undefined)
		throw new Error(`Boss ${boss.id} was loaded without includes its deaths`);

	const deathEntities = boss.deaths;

	const deathDates = deathEntities.map((deathEntity) => deathEntity.date);
	const firstDeathDate = getEarliestDate(deathDates);
	const lastDeathDate = getLatestDate(deathDates);

	const bossDeathDateRange: BossDeathDateRangeRow | null =
		firstDeathDate !== null && lastDeathDate !== null
			? { bossId: boss.id, firstDeathDate, lastDeathDate }
			: null;

	const bossBean = {
		...fromBossEntityToBossSummaryBean(boss, bossDeathDateRange),
		deaths: deathEntities.map(fromDeathEntityToDeathBean),
	};
	return bossBean;
}
