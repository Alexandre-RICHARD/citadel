import type { DeleteBossPathParamDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/deleteBoss/deleteBossPathParamDto.type.ts";

import type { DeleteBossBean } from "../../../bean/deleteBossBean.type.ts";

export function fromDeleteBossDtoToDeleteBossBean(
	deleteBossPathParamDto: DeleteBossPathParamDto,
): DeleteBossBean {
	const deleteBossBean = {
		id: deleteBossPathParamDto.id,
	};
	return deleteBossBean;
}
