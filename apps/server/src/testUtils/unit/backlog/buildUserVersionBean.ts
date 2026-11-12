import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";

import type { UserVersionBean } from "../../../projects/backlog/bean/userVersionBean.type.ts";

// Une version jouée complète, sur la plateforme donnée ; chaque test ne précise que ce qu'il lit
export function buildUserVersionBean(
	id: number,
	platformName: string,
	userVersion: Partial<UserVersionBean> = {},
): UserVersionBean {
	return {
		id,
		version: { id, title: null, coverImageId: null, igdbUrl: "u" },
		platform: {
			id,
			shortName: platformName,
			technicalName: platformName.toLowerCase(),
			parentPlatformId: null,
			subPlatformType: null,
		},
		releaseDate: null,
		doneDlcIds: [],
		status: StatusEnum.NOT_STARTED,
		isOwned: false,
		isInProgress: false,
		isUpNext: false,
		finishDate: null,
		sureFinishCount: 0,
		probableFinishCount: 0,
		trackedPlayTimeMinutes: 0,
		estimatedPlayTimeMinutes: 0,
		rating: null,
		comment: null,
		...userVersion,
	};
}
