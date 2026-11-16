import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import { getStoredMovieIdsQuery } from "../query/movie/getStoredMovieIdsQuery.ts";
import { getStoredShowIdsQuery } from "../query/tvShow/getStoredShowIdsQuery.ts";
import { tmdbGateway } from "../tmdb/tmdbGateway.ts";
import type { FetchedMedia } from "./fetchedMedia.type.ts";

/**
 * Ce qu'il faut enregistrer en base avant d'ajouter un média au backlog : rien s'il y est déjà (un média ajouté par un
 * compte sert aux autres sans relire TMDB), sinon sa fiche TMDB. Un identifiant que TMDB ne connaît pas : 404
 */
export async function fetchMediaUnlessStored(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): Promise<FetchedMedia | null> {
	const notFound = new NotFoundError(
		BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND,
		`No ${mediaType} on TMDB with id : ${tmdbId}`,
	);
	if (mediaType === MediaTypeEnum.MOVIE) {
		if ((await getStoredMovieIdsQuery([tmdbId])).has(tmdbId)) return null;
		const movie = await tmdbGateway.fetchMovie(tmdbId);
		if (movie === null) throw notFound;
		return { mediaType, movie };
	}
	if ((await getStoredShowIdsQuery([tmdbId])).has(tmdbId)) return null;
	const show = await tmdbGateway.fetchShow(tmdbId);
	if (show === null) throw notFound;
	return { mediaType, show };
}
