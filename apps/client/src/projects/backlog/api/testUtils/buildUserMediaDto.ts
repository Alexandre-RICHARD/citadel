import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// Un film du backlog, pas vu et sans saga ; chaque test ne précise que ce qu'il compare
export function buildUserMediaDto(
	id: number,
	overrides: Partial<UserMediaDto> = {},
): UserMediaDto {
	return {
		id,
		mediaType: MediaTypeEnum.MOVIE,
		tmdbId: 1000 + id,
		title: `Film ${id}`,
		originalTitle: `Film ${id}`,
		originalLanguage: "en",
		releaseDate: "2000-01-01",
		runtimeMinutes: 120,
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
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		...overrides,
	};
}
