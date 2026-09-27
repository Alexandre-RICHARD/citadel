import type { CreateBossBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossBody.dto.ts";
import type { CreateBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossPathParam.dto.ts";

import type { CreateBossBean } from "../../../bean/createBoss.bean.ts";

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
