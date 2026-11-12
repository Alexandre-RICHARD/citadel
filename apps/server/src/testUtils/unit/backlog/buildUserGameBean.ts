import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";

import type { UserGameBean } from "../../../projects/backlog/bean/userGameBean.type.ts";
import type { UserVersionBean } from "../../../projects/backlog/bean/userVersionBean.type.ts";

// Un jeu du backlog complet, avec les versions jouées données
export function buildUserGameBean(
	name: string,
	userVersions: UserVersionBean[],
): UserGameBean {
	return {
		game: {
			id: 1,
			name,
			frenchName: null,
			firstReleaseDate: null,
			isCancelled: false,
			igdbUrl: "u",
			developer: null,
			publisher: null,
			proposedSeries: null,
		},
		imageId: null,
		endingType: EndingTypeEnum.STORY,
		series: null,
		seriesNumber: null,
		seriesNumberLabel: null,
		dlcs: [],
		userVersions,
		lastActivityAt: new Date(0),
	};
}
