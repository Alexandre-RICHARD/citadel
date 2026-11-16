import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { GetMediaPostersBean } from "../bean/getMediaPostersBean.type.ts";
import type { MoviePreviewBean } from "../bean/moviePreviewBean.type.ts";
import type { ProposedSagaBean } from "../bean/proposedSagaBean.type.ts";
import type { SearchTmdbMediaBean } from "../bean/searchTmdbMediaBean.type.ts";
import type { ShowPreviewBean } from "../bean/showPreviewBean.type.ts";
import type { TmdbIdBean } from "../bean/tmdbIdBean.type.ts";
import type { TmdbSearchResultBean } from "../bean/tmdbSearchResultBean.type.ts";
import { listTmdbIdsOfType } from "../helper/listTmdbIdsOfType.ts";
import { findSagaByCollectionQuery } from "../query/saga/findSagaByCollectionQuery.ts";
import { findUserMediaIdsByTmdbQuery } from "../query/userMedia/findUserMediaIdsByTmdbQuery.ts";
import { tmdbGateway } from "../tmdb/tmdbGateway.ts";
import type { TmdbMovieData } from "../tmdb/type/tmdbMovieData.type.ts";

function tmdbMediaNotFound(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND,
		`No ${mediaType} on TMDB with id : ${tmdbId}`,
	);
}

// La saga reliée par le compte à la collection du film, sinon une nouvelle saga au nom de la collection (§4)
async function proposeSaga(
	userId: number,
	collection: TmdbMovieData["collection"],
): Promise<ProposedSagaBean | null> {
	if (collection === null) return null;
	const linked = await findSagaByCollectionQuery(userId, collection.id);
	return linked === null
		? { sagaId: null, name: collection.name }
		: { sagaId: linked.id, name: linked.name };
}

// Sa ligne dans le backlog du compte, s'il y est
async function findUserMediaId(
	userId: number,
	mediaType: MediaTypeEnum,
	tmdbId: number,
): Promise<number | null> {
	const ids = await findUserMediaIdsByTmdbQuery(userId, mediaType, [tmdbId]);
	return ids.get(tmdbId) ?? null;
}

class TmdbService {
	// Films et séries ensemble, chacun signalé s'il est déjà dans le backlog du compte
	async searchMedia(
		userId: number,
		{ query }: SearchTmdbMediaBean,
	): Promise<TmdbSearchResultBean[]> {
		const hits = await tmdbGateway.searchMedia(query);
		const [movieIds, showIds] = await Promise.all([
			findUserMediaIdsByTmdbQuery(
				userId,
				MediaTypeEnum.MOVIE,
				listTmdbIdsOfType(hits, MediaTypeEnum.MOVIE),
			),
			findUserMediaIdsByTmdbQuery(
				userId,
				MediaTypeEnum.SHOW,
				listTmdbIdsOfType(hits, MediaTypeEnum.SHOW),
			),
		]);
		return hits.map((hit) => ({
			...hit,
			userMediaId:
				(hit.mediaType === MediaTypeEnum.MOVIE ? movieIds : showIds).get(
					hit.tmdbId,
				) ?? null,
		}));
	}

	async getMoviePreview(
		userId: number,
		{ tmdbId }: TmdbIdBean,
	): Promise<MoviePreviewBean> {
		const movie = await tmdbGateway.fetchMovie(tmdbId);
		if (movie === null) throw tmdbMediaNotFound(MediaTypeEnum.MOVIE, tmdbId);
		const [proposedSaga, userMediaId] = await Promise.all([
			proposeSaga(userId, movie.collection),
			findUserMediaId(userId, MediaTypeEnum.MOVIE, tmdbId),
		]);
		return { movie, proposedSaga, userMediaId };
	}

	async getShowPreview(
		userId: number,
		{ tmdbId }: TmdbIdBean,
	): Promise<ShowPreviewBean> {
		const show = await tmdbGateway.fetchShow(tmdbId);
		if (show === null) throw tmdbMediaNotFound(MediaTypeEnum.SHOW, tmdbId);
		return {
			show,
			userMediaId: await findUserMediaId(userId, MediaTypeEnum.SHOW, tmdbId),
		};
	}

	// Les affiches d'un média ne dépendent d'aucun compte
	async getPosters({
		mediaType,
		tmdbId,
	}: GetMediaPostersBean): Promise<string[]> {
		const posterPaths = await tmdbGateway.fetchPosterPaths(mediaType, tmdbId);
		if (posterPaths === null) throw tmdbMediaNotFound(mediaType, tmdbId);
		return posterPaths;
	}
}

export const tmdbService = new TmdbService();
