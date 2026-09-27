import type { DeleteBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/deleteBoss/deleteBossPathParam.dto.ts";

import type { DeleteBossBean } from "../../../bean/deleteBoss.bean.ts";

export function fromDeleteBossDtoToDeleteBossBean(
	deleteBossPathParamDto: DeleteBossPathParamDto,
): DeleteBossBean {
	const deleteBossBean = {
		id: deleteBossPathParamDto.id,
	};
	return deleteBossBean;
}
