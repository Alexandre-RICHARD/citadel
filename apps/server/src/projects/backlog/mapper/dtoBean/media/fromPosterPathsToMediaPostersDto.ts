import type { MediaPostersDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/mediaPostersDto.type.ts";

export function fromPosterPathsToMediaPostersDto(
	posterPaths: string[],
): MediaPostersDto {
	return { posterPaths };
}
