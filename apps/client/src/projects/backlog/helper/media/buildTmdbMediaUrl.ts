import { externalLinks } from "@citadel/specs/src/links/externalLinks";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// La fiche TMDB d'un film ou d'une série : TMDB range les séries sous « tv »
export function buildTmdbMediaUrl(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): string {
	return `${externalLinks.tmdb}${mediaType === MediaTypeEnum.MOVIE ? "movie" : "tv"}/${tmdbId}`;
}
