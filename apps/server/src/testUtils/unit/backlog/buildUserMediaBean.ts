import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { UserMediaBean } from "../../../projects/backlog/bean/userMediaBean.type.ts";

// Un film du backlog, pas vu, sans saga ; chaque test ne précise que ce qu'il compare
export function buildUserMediaBean(
	overrides: Partial<UserMediaBean> = {},
): UserMediaBean {
	return {
		id: 1,
		mediaType: MediaTypeEnum.MOVIE,
		tmdbId: 603,
		title: "Matrix",
		originalTitle: "The Matrix",
		originalLanguage: "en",
		releaseDate: "1999-03-31",
		runtimeMinutes: 136,
		imagePath: null,
		saga: null,
		sagaNumber: null,
		sagaNumberLabel: null,
		isWatched: false,
		watchedEpisodeCount: 0,
		airedEpisodeCount: 0,
		isUpNext: false,
		isInProgress: false,
		comment: null,
		createdAt: new Date("2026-01-01T00:00:00Z"),
		updatedAt: new Date("2026-01-01T00:00:00Z"),
		...overrides,
	};
}
