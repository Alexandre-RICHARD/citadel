import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate.ts";
import { QueueFullError } from "@citadel/common/src/universal/limit/QueueFullError.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { buildVerificationKey } from "@citadel/specs/src/projects/backlog/helper/nas/buildVerificationKey.ts";
import type { VerificationTarget } from "@citadel/specs/src/projects/backlog/helper/nas/verificationTarget.type.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import type { Request } from "express";

import type { NasSettings } from "../../../configuration/nasSettings.type.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { ForbiddenError } from "../../../error/ForbiddenError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { ServiceUnavailableError } from "../../../error/ServiceUnavailableError.ts";
import { UnauthorizedError } from "../../../error/UnauthorizedError.ts";
import type { ConnectedShowSeasonBean } from "../bean/connectedShowSeasonBean.type.ts";
import type { ConnectedUserMediaBean } from "../bean/connectedUserMediaBean.type.ts";
import type { ForgottenMediaBean } from "../bean/forgottenMediaBean.type.ts";
import type { GetConnectedUserMediaBean } from "../bean/getConnectedUserMediaBean.type.ts";
import type { NasStatusBean } from "../bean/nasStatusBean.type.ts";
import type { SetMediaVerifiedBean } from "../bean/setMediaVerifiedBean.type.ts";
import type { UserMediaBean } from "../bean/userMediaBean.type.ts";
import type { UserMediaIdBean } from "../bean/userMediaIdBean.type.ts";
import { buildUserMediaPage } from "../helper/buildUserMediaPage.ts";
import { loadUserMediaBeans } from "../helper/loadUserMediaBeans.ts";
import { isUnlockTokenValid } from "../nas/access/isUnlockTokenValid.ts";
import { mediaPasswordHasher } from "../nas/access/mediaPasswordHasher.ts";
import { nasOwner } from "../nas/access/nasOwner.ts";
import { signUnlockToken } from "../nas/access/signUnlockToken.ts";
import { unlockCookie } from "../nas/access/unlockCookie.ts";
import { unlockThrottle } from "../nas/access/unlockThrottle.ts";
import { addTmdbGoneGap } from "../nas/merge/addTmdbGoneGap.ts";
import { describeEpisodeNas } from "../nas/merge/describeEpisodeNas.ts";
import { describeFileNas } from "../nas/merge/describeFileNas.ts";
import { describeShowNas } from "../nas/merge/describeShowNas.ts";
import { findForgottenMedia } from "../nas/merge/findForgottenMedia.ts";
import { findSurveyEntry } from "../nas/merge/findSurveyEntry.ts";
import { indexMediaSurvey } from "../nas/merge/indexMediaSurvey.ts";
import { isVerifiableEntry } from "../nas/merge/isVerifiableEntry.ts";
import { keepValidVerifications } from "../nas/merge/keepValidVerifications.ts";
import type { NasDetailsBean } from "../nas/merge/nasDetailsBean.type.ts";
import { resolveMediaSurvey } from "../nas/merge/resolveMediaSurvey.ts";
import type { SurveyIndex } from "../nas/merge/surveyIndex.type.ts";
import { toBacklogMediaRef } from "../nas/merge/toBacklogMediaRef.ts";
import { readMediaSurvey } from "../nas/state/readMediaSurvey.ts";
import { readMediaVerifications } from "../nas/state/readMediaVerifications.ts";
import { runSerially } from "../nas/state/runSerially.ts";
import { writeMediaVerifications } from "../nas/state/writeMediaVerifications.ts";
import { filterConnectedUserMedia } from "../nas/view/filterConnectedUserMedia.ts";
import { sortConnectedUserMedia } from "../nas/view/sortConnectedUserMedia.ts";
import { getGoneTmdbIdsQuery } from "../query/tmdbCheck/getGoneTmdbIdsQuery.ts";
import { getUserShowsEpisodeRefsQuery } from "../query/tvShow/getUserShowsEpisodeRefsQuery.ts";
import { userMediaService } from "./userMediaService.ts";

const CLOSED_STATUS: NasStatusBean = {
	isAvailable: false,
	isUnlocked: false,
	surveyedAt: null,
	jellyfinServerId: null,
	jellyfinPort: null,
	consolePort: null,
};

// Une rafale de vérifications du mot de passe : refusée sans calcul, à réessayer dans un instant
const BUSY_RETRY_AFTER_MS = 5000;

type MergeContext = {
	index: SurveyIndex;
	verifiedKeys: ReadonlySet<string>;
	today: string;
};

/**
 * Le dernier relevé, relié à ce backlog : chaque média du backlog y retrouve son film ou sa série, même quand un outil
 * le range sous un autre identifiant (resolveMediaSurvey). Le backlog entier, car un média relié à l'un ne l'est plus
 * à l'autre
 */
async function readResolvedSurvey(
	settings: NasSettings,
	userMediaList: UserMediaBean[],
): Promise<MediaSurvey> {
	return resolveMediaSurvey(
		await readMediaSurvey(settings.stateDir),
		userMediaList.map(toBacklogMediaRef),
	);
}

// Le relevé, et les cases « Vérifié » qui valent encore pour lui
async function loadMergeContext(
	settings: NasSettings,
	userMediaList: UserMediaBean[],
): Promise<MergeContext> {
	const [survey, verifications] = await Promise.all([
		readResolvedSurvey(settings, userMediaList),
		readMediaVerifications(settings.stateDir),
	]);
	const index = indexMediaSurvey(survey);
	return {
		index,
		verifiedKeys: new Set(
			keepValidVerifications(verifications.verifications, index).map(
				({ key }) => key,
			),
		),
		today: getTodayIsoDate(),
	};
}

// Les colonnes du NAS d'une ligne du tableau : un film, ou une série agrégée sur ses épisodes
function describeUserMediaNas(
	context: MergeContext,
	userMedia: UserMediaBean,
	episodesByShow: Awaited<ReturnType<typeof getUserShowsEpisodeRefsQuery>>,
): NasDetailsBean {
	if (userMedia.mediaType === MediaTypeEnum.SHOW)
		return describeShowNas(
			{
				...context,
				showTmdbId: userMedia.tmdbId,
				originalLanguage: userMedia.originalLanguage,
			},
			episodesByShow.get(userMedia.tmdbId) ?? [],
			true,
		);
	const movie = context.index.movies.get(userMedia.tmdbId);
	return describeFileNas({
		entry: movie?.entry ?? null,
		isVerified: context.verifiedKeys.has(
			buildVerificationKey({ kind: "movie", tmdbId: userMedia.tmdbId }),
		),
		tmdbMinutes: userMedia.runtimeMinutes,
		originalLanguage: userMedia.originalLanguage,
		jellyfinCollection: movie?.jellyfinCollection ?? null,
	});
}

function userMediaNotFound(userMediaId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
		`No backlog media with id : ${userMediaId}`,
	);
}

async function isMediaPassword(
	settings: NasSettings,
	password: string,
): Promise<boolean> {
	try {
		return await mediaPasswordHasher.verify(password, settings.passwordHash);
	} catch (error) {
		if (error instanceof QueueFullError)
			throw new ServiceUnavailableError(
				TechnicalErrorCodeEnum.TOO_MANY_REQUESTS,
				"Too many media password checks",
				BUSY_RETRY_AFTER_MS,
			);
		throw error;
	}
}

// Les cases que coche ou décoche la requête : le film, ou les épisodes envoyés (hors spéciaux, sans relevé)
async function resolveTargets(
	userId: number,
	userMedia: UserMediaBean,
	episodeIds: number[] | null,
): Promise<VerificationTarget[]> {
	if (userMedia.mediaType === MediaTypeEnum.MOVIE)
		return [{ kind: "movie", tmdbId: userMedia.tmdbId }];
	if (episodeIds === null)
		throw new ConflictError(
			BacklogErrorCodeEnum.NOT_VERIFIABLE,
			"A show is verified by its episodes",
		);
	const seasons = await userMediaService.getShowSeasons(userId, {
		userMediaId: userMedia.id,
	});
	const numbersById = new Map(
		seasons.flatMap(({ seasonNumber, episodes }) =>
			episodes.map(({ id, episodeNumber }) => [
				id,
				{ seasonNumber, episodeNumber },
			]),
		),
	);
	return episodeIds.map((episodeId) => {
		const numbers = numbersById.get(episodeId);
		if (numbers === undefined)
			throw new NotFoundError(
				BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW,
				`Episode ${episodeId} is not in this show`,
			);
		return { kind: "episode", showTmdbId: userMedia.tmdbId, ...numbers };
	});
}

/**
 * Le mode connecté du backlog des médias (§2, §3), sur l'instance locale du NAS seulement : le backlog fusionné avec le
 * dernier relevé du job, par identifiant TMDB. Sa seule écriture côté NAS : les cases « Vérifié »
 */
export const nasService = {
	// Rien du NAS ne se dit avant le déverrouillage : ni la date du relevé, ni les ports
	async getStatus(
		settings: NasSettings | null,
		request: Pick<Request, "headers">,
		userId: number,
	): Promise<NasStatusBean> {
		if (settings === null || !nasOwner.isOwner(settings, userId))
			return CLOSED_STATUS;
		const isUnlocked = isUnlockTokenValid(
			unlockCookie.read(request),
			userId,
			settings.passwordHash,
			Date.now(),
		);
		if (!isUnlocked) return { ...CLOSED_STATUS, isAvailable: true };
		const survey = await readMediaSurvey(settings.stateDir).catch(() => null);
		return {
			isAvailable: true,
			isUnlocked: true,
			surveyedAt: survey?.surveyedAt ?? null,
			jellyfinServerId: survey?.jellyfinServerId ?? null,
			jellyfinPort: settings.jellyfinPort,
			consolePort: settings.consolePort,
		};
	},

	// Le jeton du cookie de déverrouillage, valable 12 h
	async unlock(
		settings: NasSettings,
		userId: number,
		ip: string,
		password: string,
	): Promise<string> {
		unlockThrottle.claimAttempt(ip);
		if (!nasOwner.isOwner(settings, userId))
			throw new ForbiddenError(
				BacklogErrorCodeEnum.NAS_OWNER_ONLY,
				"Only the NAS owner can use the connected mode",
			);
		if (!(await isMediaPassword(settings, password)))
			throw new UnauthorizedError(
				BacklogErrorCodeEnum.MEDIA_PASSWORD_INVALID,
				"Wrong media password",
			);
		unlockThrottle.recordSuccess(ip);
		return signUnlockToken(
			userId,
			Date.now() + settings.unlockDurationMs,
			settings.passwordHash,
		);
	},

	async getConnectedUserMedia(
		settings: NasSettings,
		userId: number,
		{ page, sort, filters, filterMode }: GetConnectedUserMediaBean,
	) {
		const [userMediaList, episodesByShow, goneKeys] = await Promise.all([
			loadUserMediaBeans(userId),
			getUserShowsEpisodeRefsQuery(userId),
			getGoneTmdbIdsQuery(userId),
		]);
		const context = await loadMergeContext(settings, userMediaList);
		const rows: ConnectedUserMediaBean[] = userMediaList.map((userMedia) => {
			const nas = describeUserMediaNas(context, userMedia, episodesByShow);
			return {
				...userMedia,
				nas: goneKeys.has(`${userMedia.mediaType}:${userMedia.tmdbId}`)
					? addTmdbGoneGap(nas)
					: nas,
			};
		});
		const sorted = sortConnectedUserMedia(
			filterConnectedUserMedia(rows, filters, filterMode),
			sort,
		);
		return buildUserMediaPage(rows, sorted, page);
	},

	async getConnectedShowSeasons(
		settings: NasSettings,
		userId: number,
		{ userMediaId }: UserMediaIdBean,
	): Promise<ConnectedShowSeasonBean[]> {
		const [userMediaList, seasons] = await Promise.all([
			loadUserMediaBeans(userId),
			userMediaService.getShowSeasons(userId, { userMediaId }),
		]);
		const userMedia = userMediaList.find(({ id }) => id === userMediaId);
		if (userMedia === undefined) throw userMediaNotFound(userMediaId);
		const context = await loadMergeContext(settings, userMediaList);
		const showContext = {
			...context,
			showTmdbId: userMedia.tmdbId,
			originalLanguage: userMedia.originalLanguage,
		};
		return seasons.map((season) => {
			const episodes = season.episodes.map((episode) => ({
				...episode,
				seasonNumber: season.seasonNumber,
			}));
			const isSpecials = season.seasonNumber === 0;
			return {
				...season,
				nas: isSpecials ? null : describeShowNas(showContext, episodes, false),
				episodes: season.episodes.map((episode) => ({
					...episode,
					nas: isSpecials
						? null
						: describeEpisodeNas(showContext, {
								...episode,
								seasonNumber: season.seasonNumber,
							}),
				})),
			};
		});
	},

	/**
	 * Coche ou décoche des cases « Vérifié ». Une case cochée garde l'empreinte du fichier du dernier relevé ; dans une
	 * cascade, les épisodes sans fichier ou en doublon sont passés. Les cases devenues fausses (fichier remplacé) quittent
	 * le fichier à cette écriture
	 */
	async setVerified(
		settings: NasSettings,
		userId: number,
		{ userMediaId, episodeIds, isVerified }: SetMediaVerifiedBean,
	): Promise<void> {
		const userMediaList = await loadUserMediaBeans(userId);
		const userMedia = userMediaList.find(({ id }) => id === userMediaId);
		if (userMedia === undefined) throw userMediaNotFound(userMediaId);
		const targets = await resolveTargets(userId, userMedia, episodeIds);
		await runSerially(async () => {
			const [survey, verifications] = await Promise.all([
				readResolvedSurvey(settings, userMediaList),
				readMediaVerifications(settings.stateDir),
			]);
			const index = indexMediaSurvey(survey);
			const keys = new Set(targets.map(buildVerificationKey));
			const kept = keepValidVerifications(
				verifications.verifications,
				index,
			).filter(({ key }) => !keys.has(key));
			const verifiedAt = new Date().toISOString();
			const added = isVerified
				? targets.flatMap((target) => {
						const entry = findSurveyEntry(index, target);
						return isVerifiableEntry(entry)
							? [
									{
										key: buildVerificationKey(target),
										inode: entry.file.inode,
										sizeBytes: entry.file.sizeBytes,
										verifiedAt,
									},
								]
							: [];
					})
				: [];
			if (isVerified && added.length === 0)
				throw new ConflictError(
					BacklogErrorCodeEnum.NOT_VERIFIABLE,
					"No single file to verify",
				);
			await writeMediaVerifications(settings.stateDir, {
				...verifications,
				verifications: [...kept, ...added],
			});
		});
	},

	async getForgottenMedia(
		settings: NasSettings,
		userId: number,
	): Promise<ForgottenMediaBean[]> {
		const userMediaList = await loadUserMediaBeans(userId);
		return findForgottenMedia(
			await readResolvedSurvey(settings, userMediaList),
			new Set(
				userMediaList.map(({ mediaType, tmdbId }) => `${mediaType}:${tmdbId}`),
			),
		);
	},
};
