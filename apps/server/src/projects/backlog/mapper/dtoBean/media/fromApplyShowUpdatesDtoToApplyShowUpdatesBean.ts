import type { ApplyShowUpdatesBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/applyShowUpdates/applyShowUpdatesBodyDto.type.ts";

import type { ApplyShowUpdatesBean } from "../../../bean/applyShowUpdatesBean.type.ts";

export function fromApplyShowUpdatesDtoToApplyShowUpdatesBean(
	bodyDto: ApplyShowUpdatesBodyDto,
): ApplyShowUpdatesBean {
	return { tmdbIds: bodyDto.tmdbIds };
}
