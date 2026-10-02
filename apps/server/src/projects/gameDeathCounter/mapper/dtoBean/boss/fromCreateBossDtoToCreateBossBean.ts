import type { CreateBossBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossBodyDto.ts";
import type { CreateBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossPathParamDto.ts";

import type { CreateBossBean } from "../../../bean/createBossBean.ts";

export function fromCreateBossDtoToCreateBossBean(
	createBossPathParamDto: CreateBossPathParamDto,
	createBossBodyDto: CreateBossBodyDto,
): CreateBossBean {
	const createBossBean = {
		name: createBossBodyDto.name,
		gameId: createBossPathParamDto.gameId,
	};
	return createBossBean;
}
