import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Les identifiants TMDB des médias d'un type : un film et une série peuvent porter le même
export function listTmdbIdsOfType(
	media: readonly { mediaType: MediaTypeEnum; tmdbId: number }[],
	mediaType: MediaTypeEnum,
): number[] {
	return media
		.filter((item) => item.mediaType === mediaType)
		.map(({ tmdbId }) => tmdbId);
}
