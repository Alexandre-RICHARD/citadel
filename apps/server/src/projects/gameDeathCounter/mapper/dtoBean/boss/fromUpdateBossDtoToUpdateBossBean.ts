import type { UpdateBossBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossBody.dto.ts";
import type { UpdateBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossPathParam.dto.ts";

import type { UpdateBossBean } from "../../../bean/updateBoss.bean.ts";

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
