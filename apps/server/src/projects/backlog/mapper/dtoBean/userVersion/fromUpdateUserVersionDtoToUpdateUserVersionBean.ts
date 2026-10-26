import type { UpdateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionBodyDto.type.ts";
import type { UpdateUserVersionPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionPathParamDto.type.ts";

import type { UpdateUserVersionBean } from "../../../bean/updateUserVersionBean.type.ts";

// Les champs absents du corps restent undefined : ils ne changent pas
export function fromUpdateUserVersionDtoToUpdateUserVersionBean(
	pathParamDto: UpdateUserVersionPathParamDto,
	bodyDto: UpdateUserVersionBodyDto,
): UpdateUserVersionBean {
	return {
		id: pathParamDto.id,
		changes: {
			status: bodyDto.status,
			isOwned: bodyDto.isOwned,
			isUpNext: bodyDto.isUpNext,
			finishDate: bodyDto.finishDate,
			sureFinishCount: bodyDto.sureFinishCount,
			probableFinishCount: bodyDto.probableFinishCount,
			trackedPlayTimeMinutes: bodyDto.trackedPlayTimeMinutes,
			estimatedPlayTimeMinutes: bodyDto.estimatedPlayTimeMinutes,
			rating: bodyDto.rating,
			comment: bodyDto.comment,
		},
	};
}
