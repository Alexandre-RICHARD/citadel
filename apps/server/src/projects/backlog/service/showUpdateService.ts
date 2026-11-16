import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";
import { createExpiringCache } from "@citadel/common/src/universal/cache/createExpiringCache.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { ApplyShowUpdatesBean } from "../bean/applyShowUpdatesBean.type.ts";
import type { ShowRefreshResultBean } from "../bean/showRefreshResultBean.type.ts";
import type { ShowUpdateBean } from "../bean/showUpdateBean.type.ts";
import { countShowNews } from "../helper/countShowNews.ts";
import { getOngoingShowIdsQuery } from "../query/tvShow/getOngoingShowIdsQuery.ts";
import { getStoredShowContentQuery } from "../query/tvShow/getStoredShowContentQuery.ts";
import { upsertShowQuery } from "../query/tvShow/upsertShowQuery.ts";
import { findUserMediaIdsByTmdbQuery } from "../query/userMedia/findUserMediaIdsByTmdbQuery.ts";
import { tmdbGateway } from "../tmdb/tmdbGateway.ts";
import type { TmdbShowData } from "../tmdb/type/tmdbShowData.type.ts";

// Quelques séries lues en même temps ; le client TMDB les espace de toute façon
const READ_CONCURRENCY = 4;
// Le récapitulatif s'affiche, puis « Valider » enregistre ce qu'il montrait, sans relire TMDB
const SUMMARY_LIFETIME_MS = 10 * 60_000;
const MAX_CACHED_SHOWS = 500;

// Clé : « compte:série » ; chaque compte valide ce que son propre récapitulatif lui a montré
const summaryCache = createExpiringCache<string, TmdbShowData>({
	durationMs: SUMMARY_LIFETIME_MS,
	maxEntries: MAX_CACHED_SHOWS,
});

function cacheKey(userId: number, tmdbId: number): string {
	return `${userId}:${tmdbId}`;
}

// La fiche du jour de chaque série ; une série que TMDB ne connaît plus est laissée telle quelle en base
async function fetchFreshShows(tmdbIds: number[]): Promise<TmdbShowData[]> {
	const shows = await mapWithConcurrency(tmdbIds, READ_CONCURRENCY, (tmdbId) =>
		tmdbGateway.fetchFreshShow(tmdbId),
	);
	return shows.filter((show) => show !== null);
}

async function storeShow(show: TmdbShowData): Promise<void> {
	await runInTransaction("Failed to store show updates", (transaction) =>
		upsertShowQuery(show, transaction),
	);
}

/**
 * Nouveaux épisodes et saisons des séries « en cours » (§7.3) : à la demande pour un compte, avec un récapitulatif à
 * valider, et chaque nuit pour tous, sans validation. Le NAS n'y est pour rien : seule la base du site change
 */
class ShowUpdateService {
	// « Récupérer les nouveautés des séries » : rien n'est enregistré, le récapitulatif attend « Valider »
	async getShowUpdates(userId: number): Promise<ShowUpdateBean[]> {
		const shows = await fetchFreshShows(await getOngoingShowIdsQuery(userId));
		const updates: ShowUpdateBean[] = [];
		for (const show of shows) {
			// eslint-disable-next-line no-await-in-loop -- une requête par série, toutes déjà lues sur TMDB
			const stored = await getStoredShowContentQuery(show.id);
			const news = countShowNews(show, stored);
			if (news.newSeasonCount === 0 && news.newEpisodeCount === 0) continue;
			summaryCache.set([cacheKey(userId, show.id)], show);
			updates.push({ tmdbId: show.id, title: show.name, ...news });
		}
		return updates;
	}

	// « Valider » : les séries choisies, telles que le récapitulatif les a montrées (relues si le récapitulatif a expiré)
	async applyShowUpdates(
		userId: number,
		{ tmdbIds }: ApplyShowUpdatesBean,
	): Promise<number> {
		const inBacklog = await findUserMediaIdsByTmdbQuery(
			userId,
			MediaTypeEnum.SHOW,
			tmdbIds,
		);
		const missingId = tmdbIds.find((tmdbId) => !inBacklog.has(tmdbId));
		if (missingId !== undefined)
			throw new NotFoundError(
				BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
				`No show in the backlog with TMDB id : ${missingId}`,
			);
		const cached = tmdbIds.flatMap((tmdbId) => {
			const show = summaryCache.get(cacheKey(userId, tmdbId));
			return show === undefined ? [] : [show];
		});
		const cachedIds = new Set(cached.map(({ id }) => id));
		const shows = [
			...cached,
			...(await fetchFreshShows(
				tmdbIds.filter((tmdbId) => !cachedIds.has(tmdbId)),
			)),
		];
		for (const show of shows)
			// eslint-disable-next-line no-await-in-loop -- une transaction par série : un échec n'annule pas les autres
			await storeShow(show);
		return shows.length;
	}

	// Le passage de nuit (job media-tmdb) : les séries en cours de tous les comptes, relues et enregistrées
	async refreshOngoingShows(): Promise<ShowRefreshResultBean> {
		const tmdbIds = await getOngoingShowIdsQuery(null);
		const shows = await fetchFreshShows(tmdbIds);
		let updatedCount = 0;
		for (const show of shows) {
			// eslint-disable-next-line no-await-in-loop -- une série à la fois : la base n'est jamais verrouillée longtemps
			const stored = await getStoredShowContentQuery(show.id);
			const news = countShowNews(show, stored);
			// eslint-disable-next-line no-await-in-loop -- idem
			await storeShow(show);
			if (news.newSeasonCount > 0 || news.newEpisodeCount > 0)
				updatedCount += 1;
		}
		return { checkedCount: tmdbIds.length, updatedCount };
	}
}

export const showUpdateService = new ShowUpdateService();
