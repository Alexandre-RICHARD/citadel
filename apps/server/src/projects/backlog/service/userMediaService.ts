import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CreateUserMediaBean } from "../bean/createUserMediaBean.type.ts";
import type { CustomizeUserMediaBean } from "../bean/customizeUserMediaBean.type.ts";
import type { GetAllUserMediaBean } from "../bean/getAllUserMediaBean.type.ts";
import type { MediaCustomizationBean } from "../bean/mediaCustomizationBean.type.ts";
import type { SetEpisodesWatchedBean } from "../bean/setEpisodesWatchedBean.type.ts";
import type { ShowSeasonBean } from "../bean/showSeasonBean.type.ts";
import type { UpdateUserMediaBean } from "../bean/updateUserMediaBean.type.ts";
import type { UserMediaBean } from "../bean/userMediaBean.type.ts";
import type { UserMediaIdBean } from "../bean/userMediaIdBean.type.ts";
import type { UserMediaPageBean } from "../bean/userMediaPageBean.type.ts";
import { buildUserMediaPage } from "../helper/buildUserMediaPage.ts";
import { fetchMediaUnlessStored } from "../helper/fetchMediaUnlessStored.ts";
import { loadUserMediaBean } from "../helper/loadUserMediaBean.ts";
import { loadUserMediaBeans } from "../helper/loadUserMediaBeans.ts";
import { resolveSagaPlacement } from "../helper/resolveSagaPlacement.ts";
import { storeFetchedMedia } from "../helper/storeFetchedMedia.ts";
import type { UserMedia } from "../models/UserMedia.ts";
import { getMovieCollectionQuery } from "../query/movie/getMovieCollectionQuery.ts";
import { deleteUnusedSagasQuery } from "../query/saga/deleteUnusedSagasQuery.ts";
import { linkCollectionToSagaQuery } from "../query/saga/linkCollectionToSagaQuery.ts";
import { updateSagaNumbersQuery } from "../query/saga/updateSagaNumbersQuery.ts";
import { getShowSeasonsQuery } from "../query/tvShow/getShowSeasonsQuery.ts";
import { createUserMediaQuery } from "../query/userMedia/createUserMediaQuery.ts";
import { deleteUserMediaQuery } from "../query/userMedia/deleteUserMediaQuery.ts";
import { findUserMediaIdsByTmdbQuery } from "../query/userMedia/findUserMediaIdsByTmdbQuery.ts";
import { getShowEpisodeIdsQuery } from "../query/userMedia/getShowEpisodeIdsQuery.ts";
import { getUserMediaQuery } from "../query/userMedia/getUserMediaQuery.ts";
import { updateUserMediaQuery } from "../query/userMedia/updateUserMediaQuery.ts";
import { deleteShowWatchedEpisodesQuery } from "../query/watchedEpisode/deleteShowWatchedEpisodesQuery.ts";
import { setWatchedEpisodesQuery } from "../query/watchedEpisode/setWatchedEpisodesQuery.ts";
import { filterUserMediaBeans } from "../view/media/filterUserMediaBeans.ts";
import { sortUserMediaBeans } from "../view/media/sortUserMediaBeans.ts";

function userMediaNotFound(userMediaId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
		`No backlog media with id : ${userMediaId}`,
	);
}

// Une ligne du compte, verrouillée jusqu'à la fin de la transaction ; celle d'un autre compte répond comme absente
async function lockUserMedia(
	userId: number,
	userMediaId: number,
	transaction: Transaction,
): Promise<UserMedia> {
	const userMedia = await getUserMediaQuery(userId, userMediaId, transaction);
	if (userMedia === null) throw userMediaNotFound(userMediaId);
	return userMedia;
}

/**
 * Range le média dans sa saga et écrit sa personnalisation ; les médias que son numéro décale avancent. La collection
 * TMDB d'un film rangé dans une saga lui est reliée si elle ne l'est à aucune : ses autres films proposeront cette saga
 */
async function saveCustomization(
	userId: number,
	userMedia: Pick<UserMedia, "id" | "movieId">,
	customization: MediaCustomizationBean,
	transaction: Transaction,
): Promise<void> {
	const collection =
		userMedia.movieId === null
			? null
			: await getMovieCollectionQuery(userMedia.movieId, transaction);
	const { sagaId, sagaNumber, shiftedEntries } = await resolveSagaPlacement(
		userId,
		userMedia.id,
		collection,
		customization,
		transaction,
	);
	await updateSagaNumbersQuery(userId, shiftedEntries, transaction);
	if (collection !== null && sagaId !== null)
		await linkCollectionToSagaQuery(userId, collection.id, sagaId, transaction);
	await updateUserMediaQuery(
		userId,
		userMedia.id,
		{ imagePath: customization.imagePath, sagaId, sagaNumber },
		transaction,
	);
}

// La ligne relue après une écriture ; elle existe, puisque la transaction vient de l'écrire
async function reloadUserMediaBean(
	userId: number,
	userMediaId: number,
): Promise<UserMediaBean> {
	const userMedia = await loadUserMediaBean(userId, userMediaId);
	if (userMedia === null) throw userMediaNotFound(userMediaId);
	return userMedia;
}

// Chaque méthode ne voit que le backlog du compte : le média du backlog d'un autre répond comme absent (404)
class UserMediaService {
	/**
	 * Tableau des films et séries : tout le backlog du compte est lu, filtré et trié en mémoire, comme celui des jeux, puis
	 * découpé en pages. Le résumé (films, séries) et les langues proposées au filtre portent sur tout le backlog
	 */
	async getAllUserMedia(
		userId: number,
		{ page, sort, filters, filterMode }: GetAllUserMediaBean,
	): Promise<UserMediaPageBean> {
		const userMediaList = await loadUserMediaBeans(userId);
		const sorted = sortUserMediaBeans(
			filterUserMediaBeans(userMediaList, filters, filterMode),
			sort,
		);
		return buildUserMediaPage(userMediaList, sorted, page);
	}

	// Dépliage d'une série : ses saisons et leurs épisodes, avec ceux que le compte a vus ; un film n'en a aucune
	async getShowSeasons(
		userId: number,
		{ userMediaId }: UserMediaIdBean,
	): Promise<ShowSeasonBean[]> {
		const userMedia = await getUserMediaQuery(userId, userMediaId);
		if (userMedia === null) throw userMediaNotFound(userMediaId);
		return userMedia.tvShowId === null
			? []
			: getShowSeasonsQuery(userId, userMedia.tvShowId);
	}

	/**
	 * Ajout au backlog. Le média est d'abord lu sur TMDB s'il n'est pas en base (une série avec toutes ses saisons et tous
	 * ses épisodes, sans choix possible, §7.1), hors transaction : la base ne reste pas verrouillée pendant l'appel
	 */
	async createUserMedia(
		userId: number,
		{ mediaType, tmdbId, customization }: CreateUserMediaBean,
	): Promise<UserMediaBean> {
		const fetched = await fetchMediaUnlessStored(mediaType, tmdbId);
		const userMediaId = await runInTransaction(
			"Failed to add media to the backlog",
			async (transaction) => {
				const existing = await findUserMediaIdsByTmdbQuery(
					userId,
					mediaType,
					[tmdbId],
					transaction,
				);
				if (existing.has(tmdbId))
					throw new ConflictError(
						BacklogErrorCodeEnum.USER_MEDIA_ALREADY_EXISTS,
						`${mediaType} already in the backlog : ${tmdbId}`,
					);
				if (fetched !== null) await storeFetchedMedia(fetched, transaction);

				const isMovie = mediaType === MediaTypeEnum.MOVIE;
				const movieId = isMovie ? tmdbId : null;
				const id = await createUserMediaQuery(
					{
						userId,
						movieId,
						tvShowId: isMovie ? null : tmdbId,
						imagePath: customization.imagePath,
					},
					transaction,
				);
				await saveCustomization(
					userId,
					{ id, movieId },
					customization,
					transaction,
				);
				return id;
			},
		);
		return reloadUserMediaBean(userId, userMediaId);
	}

	// « Personnaliser » : miniature, saga et numéro ; une saga qui n'a plus de média quitte la base
	async customizeUserMedia(
		userId: number,
		{ userMediaId, customization }: CustomizeUserMediaBean,
	): Promise<UserMediaBean> {
		await runInTransaction(
			"Failed to customize backlog media",
			async (transaction) => {
				const userMedia = await lockUserMedia(userId, userMediaId, transaction);
				await saveCustomization(userId, userMedia, customization, transaction);
				await deleteUnusedSagasQuery(userId, transaction);
			},
		);
		return reloadUserMediaBean(userId, userMediaId);
	}

	// Une cellule : seuls les champs envoyés changent. « Vu » d'une série se coche par ses épisodes
	async updateUserMedia(
		userId: number,
		{ userMediaId, changes }: UpdateUserMediaBean,
	): Promise<UserMediaBean> {
		await runInTransaction(
			"Failed to update backlog media",
			async (transaction) => {
				const userMedia = await lockUserMedia(userId, userMediaId, transaction);
				if (changes.isWatched !== undefined && userMedia.movieId === null)
					throw new ConflictError(
						BacklogErrorCodeEnum.WATCHED_ONLY_FOR_MOVIES,
						`Backlog media ${userMediaId} is a show: its episodes are watched, not the show`,
					);
				await updateUserMediaQuery(userId, userMediaId, changes, transaction);
			},
		);
		return reloadUserMediaBean(userId, userMediaId);
	}

	/**
	 * Cases « vu » des épisodes d'une série. Les cascades (saison, série, épisodes précédents ou suivants) sont proposées et
	 * confirmées par le front, qui envoie la liste complète : le serveur vérifie seulement qu'elle est à cette série
	 */
	async setEpisodesWatched(
		userId: number,
		{ userMediaId, episodeIds, isWatched }: SetEpisodesWatchedBean,
	): Promise<UserMediaBean> {
		await runInTransaction(
			"Failed to save watched episodes",
			async (transaction) => {
				const userMedia = await lockUserMedia(userId, userMediaId, transaction);
				const showEpisodeIds =
					userMedia.tvShowId === null
						? new Set<number>()
						: await getShowEpisodeIdsQuery(userMedia.tvShowId, transaction);
				const foreignId = episodeIds.find((id) => !showEpisodeIds.has(id));
				if (foreignId !== undefined)
					throw new NotFoundError(
						BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW,
						`Episode ${foreignId} is not an episode of backlog media ${userMediaId}`,
					);
				await setWatchedEpisodesQuery(
					userId,
					episodeIds,
					isWatched,
					transaction,
				);
			},
		);
		return reloadUserMediaBean(userId, userMediaId);
	}

	// « Retirer du backlog » : la personnalisation et les épisodes vus partent ; le média reste en base, pour les autres
	async deleteUserMedia(
		userId: number,
		{ userMediaId }: UserMediaIdBean,
	): Promise<void> {
		await runInTransaction(
			"Failed to remove media from the backlog",
			async (transaction) => {
				const userMedia = await lockUserMedia(userId, userMediaId, transaction);
				if (userMedia.tvShowId !== null)
					await deleteShowWatchedEpisodesQuery(
						userId,
						userMedia.tvShowId,
						transaction,
					);
				await deleteUserMediaQuery(userId, userMediaId, transaction);
				await deleteUnusedSagasQuery(userId, transaction);
			},
		);
	}
}

export const userMediaService = new UserMediaService();
