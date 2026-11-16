import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";
import { MediaImportRejectionEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportRejection.enum.ts";
import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { logError } from "../../../error/logError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { MediaImportBean } from "../bean/mediaImportBean.type.ts";
import type { MediaImportEntryBean } from "../bean/mediaImportEntryBean.type.ts";
import type { MediaImportRecognizedBean } from "../bean/mediaImportRecognizedBean.type.ts";
import type { MediaImportRejectedBean } from "../bean/mediaImportRejectedBean.type.ts";
import { createMediaImportJob } from "../helper/createMediaImportJob.ts";
import type { FetchedMedia } from "../helper/fetchedMedia.type.ts";
import { listTmdbIdsOfType } from "../helper/listTmdbIdsOfType.ts";
import { sortImportEntries } from "../helper/sortImportEntries.ts";
import { getStoredMediaSummariesQuery } from "../query/movie/getStoredMediaSummariesQuery.ts";
import { getStoredMovieIdsQuery } from "../query/movie/getStoredMovieIdsQuery.ts";
import { upsertMoviesQuery } from "../query/movie/upsertMoviesQuery.ts";
import { getStoredShowIdsQuery } from "../query/tvShow/getStoredShowIdsQuery.ts";
import { upsertShowQuery } from "../query/tvShow/upsertShowQuery.ts";
import { createUserMediaListQuery } from "../query/userMedia/createUserMediaListQuery.ts";
import { findUserMediaIdsByTmdbQuery } from "../query/userMedia/findUserMediaIdsByTmdbQuery.ts";
import { tmdbGateway } from "../tmdb/tmdbGateway.ts";

// Plusieurs fiches lues en même temps : le client TMDB les espace de toute façon à 20 par seconde
const READ_CONCURRENCY = 8;
// Un aperçu prêt (ou un échec) attend « Valider » une heure, puis disparaît
const FINISHED_IMPORT_LIFETIME_MS = 60 * 60_000;

type MediaImportJob = ReturnType<typeof createMediaImportJob>;

function rejectAll(
	entries: MediaImportEntryBean[],
	reason: MediaImportRejectionEnum,
): MediaImportRejectedBean[] {
	return entries.map((entry) => ({ ...entry, reason }));
}

function toRecognized(media: FetchedMedia): MediaImportRecognizedBean {
	return media.mediaType === MediaTypeEnum.MOVIE
		? {
				mediaType: media.mediaType,
				tmdbId: media.movie.id,
				title: media.movie.title,
				date: media.movie.releaseDate,
				posterPath: media.movie.posterPath,
			}
		: {
				mediaType: media.mediaType,
				tmdbId: media.show.id,
				title: media.show.name,
				date: media.show.firstAirDate,
				posterPath: media.show.posterPath,
			};
}

// La fiche du jour sur TMDB : l'import ne passe pas par le cache des fiches ouvertes
async function fetchFresh(
	entry: MediaImportEntryBean,
): Promise<FetchedMedia | null> {
	if (entry.mediaType === MediaTypeEnum.MOVIE) {
		const movie = await tmdbGateway.fetchFreshMovie(entry.tmdbId);
		return movie === null ? null : { mediaType: entry.mediaType, movie };
	}
	const show = await tmdbGateway.fetchFreshShow(entry.tmdbId);
	return show === null ? null : { mediaType: entry.mediaType, show };
}

// Les médias de la liste déjà dans le backlog du compte, par type
async function findInBacklog(
	userId: number,
	entries: readonly { mediaType: MediaTypeEnum; tmdbId: number }[],
	transaction: Parameters<typeof findUserMediaIdsByTmdbQuery>[3] = null,
) {
	const [movies, shows] = await Promise.all(
		[MediaTypeEnum.MOVIE, MediaTypeEnum.SHOW].map((mediaType) =>
			findUserMediaIdsByTmdbQuery(
				userId,
				mediaType,
				listTmdbIdsOfType(entries, mediaType),
				transaction,
			),
		),
	);
	return { movies: new Set(movies?.keys()), shows: new Set(shows?.keys()) };
}

/**
 * Lit les lignes de la liste : doublons et médias déjà au backlog sont écartés, ceux qui sont en base sont reconnus
 * sans relire TMDB, et les autres sont lus sur TMDB au rythme du client (§7.2)
 */
async function readEntries(
	userId: number,
	job: MediaImportJob,
	entries: MediaImportEntryBean[],
): Promise<void> {
	const [inBacklog, storedMovies, storedShows] = await Promise.all([
		findInBacklog(userId, entries),
		getStoredMovieIdsQuery(listTmdbIdsOfType(entries, MediaTypeEnum.MOVIE)),
		getStoredShowIdsQuery(listTmdbIdsOfType(entries, MediaTypeEnum.SHOW)),
	]);
	const sorted = sortImportEntries(entries, inBacklog, {
		movies: storedMovies,
		shows: storedShows,
	});
	job.reject([
		...rejectAll(sorted.duplicates, MediaImportRejectionEnum.DUPLICATE),
		...rejectAll(
			sorted.alreadyInBacklog,
			MediaImportRejectionEnum.ALREADY_IN_BACKLOG,
		),
	]);
	const storedSummaries = await Promise.all(
		[MediaTypeEnum.MOVIE, MediaTypeEnum.SHOW].map((mediaType) =>
			getStoredMediaSummariesQuery(
				mediaType,
				listTmdbIdsOfType(sorted.stored, mediaType),
			),
		),
	);
	job.recognize(storedSummaries.flat());
	job.markRead(entries.length - sorted.toFetch.length);

	await mapWithConcurrency(sorted.toFetch, READ_CONCURRENCY, async (entry) => {
		if (job.isCancelled()) return;
		const media = await fetchFresh(entry);
		if (media === null)
			job.reject(rejectAll([entry], MediaImportRejectionEnum.TMDB_NOT_FOUND));
		else {
			job.keepFetched(media);
			job.recognize([toRecognized(media)]);
		}
		job.markRead();
	});
	job.complete();
}

/**
 * Import de liste (§7.2) : les fiches se lisent en arrière-plan, au rythme du client TMDB, et rien n'est écrit en base
 * avant « Valider ». Un import par compte, gardé en mémoire : un redémarrage du serveur le perd, il suffit de le relancer
 */
class MediaImportService {
	#jobs = new Map<number, MediaImportJob>();

	// L'import du compte, s'il en a un qui n'a pas expiré
	#currentJob(userId: number): MediaImportJob | null {
		const job = this.#jobs.get(userId);
		if (job === undefined) return null;
		if (job.hasExpired(FINISHED_IMPORT_LIFETIME_MS)) {
			this.#jobs.delete(userId);
			return null;
		}
		return job;
	}

	#requireJob(userId: number): MediaImportJob {
		const job = this.#currentJob(userId);
		if (job === null)
			throw new NotFoundError(
				BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_FOUND,
				`No media import for user : ${userId}`,
			);
		return job;
	}

	startImport(
		userId: number,
		entries: MediaImportEntryBean[],
	): Promise<MediaImportBean> {
		if (this.#currentJob(userId)?.getStatus() === MediaImportStatusEnum.READING)
			throw new ConflictError(
				BacklogErrorCodeEnum.MEDIA_IMPORT_ALREADY_RUNNING,
				`A media import is already running for user : ${userId}`,
			);
		const job = createMediaImportJob(entries.length);
		this.#jobs.set(userId, job);
		// Pas d'await : la lecture continue après la réponse, que le front suit par getImport
		void readEntries(userId, job, entries).catch(async (error: unknown) => {
			job.fail();
			await logError(error, "media import");
		});
		return Promise.resolve(job.toBean());
	}

	getImport(userId: number): Promise<MediaImportBean> {
		return Promise.resolve(this.#requireJob(userId).toBean());
	}

	/**
	 * « Valider » : les fiches lues entrent en base, puis les médias reconnus au backlog, avec les valeurs par défaut
	 * (première affiche, sans saga, rien de coché). Un média ajouté au backlog entre-temps n'est pas ajouté deux fois
	 */
	async validateImport(userId: number): Promise<number> {
		const job = this.#requireJob(userId);
		if (job.getStatus() !== MediaImportStatusEnum.READY)
			throw new ConflictError(
				BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_READY,
				`The media import of user ${userId} is ${job.getStatus()}`,
			);
		const fetched = job.getFetched();
		const recognized = job.getRecognized();
		const addedCount = await runInTransaction(
			"Failed to validate media import",
			async (transaction) => {
				await upsertMoviesQuery(
					fetched.flatMap((media) =>
						media.mediaType === MediaTypeEnum.MOVIE ? [media.movie] : [],
					),
					transaction,
				);
				for (const media of fetched)
					if (media.mediaType === MediaTypeEnum.SHOW)
						// eslint-disable-next-line no-await-in-loop -- une série à la fois dans la même transaction
						await upsertShowQuery(media.show, transaction);

				const inBacklog = await findInBacklog(userId, recognized, transaction);
				const rows = recognized
					.filter(({ mediaType, tmdbId }) =>
						mediaType === MediaTypeEnum.MOVIE
							? !inBacklog.movies.has(tmdbId)
							: !inBacklog.shows.has(tmdbId),
					)
					.map(({ mediaType, tmdbId, posterPath }) => ({
						movieId: mediaType === MediaTypeEnum.MOVIE ? tmdbId : null,
						tvShowId: mediaType === MediaTypeEnum.SHOW ? tmdbId : null,
						imagePath: posterPath,
					}));
				await createUserMediaListQuery(userId, rows, transaction);
				return rows.length;
			},
		);
		this.#jobs.delete(userId);
		return addedCount;
	}

	// Annuler : la lecture s'arrête à la fiche suivante, rien n'a été écrit
	cancelImport(userId: number): Promise<void> {
		this.#requireJob(userId).cancel();
		this.#jobs.delete(userId);
		return Promise.resolve();
	}
}

export const mediaImportService = new MediaImportService();
