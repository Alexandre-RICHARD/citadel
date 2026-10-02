import { getEarliestDate } from "@citadel/common/src/universal/date/getEarliestDate.ts";
import { getLatestDate } from "@citadel/common/src/universal/date/getLatestDate.ts";

import type { BossBean } from "../../../bean/boss.bean.ts";
import type { BossDeathDateRangeRow } from "../../../dbType/bossDeathDateRange.row.ts";
import type { BossWithDeathsEntity } from "../../../dbType/bossWithDeaths.entity.ts";
import { fromDeathEntityToDeathBean } from "../death/fromDeathEntityToDeathBean.ts";
import { fromBossEntityToBossSummaryBean } from "./fromBossEntityToBossSummaryBean.ts";

export function fromBossEntityToBossBean(boss: BossWithDeathsEntity): BossBean {
	const deathDates = boss.deaths.map((deathEntity) => deathEntity.date);
	const firstDeathDate = getEarliestDate(deathDates);
	const lastDeathDate = getLatestDate(deathDates);

	const bossDeathDateRange: BossDeathDateRangeRow | null =
		firstDeathDate !== null && lastDeathDate !== null
			? { bossId: boss.id, firstDeathDate, lastDeathDate }
			: null;

	const bossBean = {
		...fromBossEntityToBossSummaryBean(boss, bossDeathDateRange),
		deaths: boss.deaths.map(fromDeathEntityToDeathBean),
	};
	return bossBean;
}
