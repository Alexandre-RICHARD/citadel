import type { CreateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodyDto.type.ts";

import type { NewUserVersionBean } from "../../../bean/newUserVersionBean.type.ts";

export function fromNewUserVersionDtoToNewUserVersionBean(
	userVersionDto: CreateUserVersionBodyDto,
): NewUserVersionBean {
	return {
		versionId: userVersionDto.versionId,
		platformId: userVersionDto.platformId,
		status: userVersionDto.status,
		isOwned: userVersionDto.isOwned,
		isUpNext: userVersionDto.isUpNext,
		finishDate: userVersionDto.finishDate,
		sureFinishCount: userVersionDto.sureFinishCount,
		probableFinishCount: userVersionDto.probableFinishCount,
		trackedPlayTimeMinutes: userVersionDto.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: userVersionDto.estimatedPlayTimeMinutes,
		rating: userVersionDto.rating,
		comment: userVersionDto.comment,
		doneDlcIds: userVersionDto.doneDlcIds,
	};
}
