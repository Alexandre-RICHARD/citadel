import type { UpdateBossBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossBodyDto.type.ts";
import type { UpdateBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossPathParamDto.type.ts";

import type { UpdateBossBean } from "../../../bean/updateBossBean.type.ts";

export function fromUpdateBossDtoToUpdateBossBean(
	updateBossPathParamDto: UpdateBossPathParamDto,
	updateBossBodyDto: UpdateBossBodyDto,
): UpdateBossBean {
	const updateBossBean = {
		id: updateBossPathParamDto.id,
		name: updateBossBodyDto.name,
		gameId: updateBossBodyDto.gameId,
	};
	return updateBossBean;
}
