import type { CreateBossBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossBody.dto.ts";

import type { CreateBossBean } from "../../../bean/createBoss.bean.ts";

export function fromCreateBossDtoToCreateBossBean(
	createBossBodyDto: CreateBossBodyDto,
): CreateBossBean {
	const createBossBean = {
		name: createBossBodyDto.name,
		gameId: createBossBodyDto.gameId,
	};
	return createBossBean;
}
