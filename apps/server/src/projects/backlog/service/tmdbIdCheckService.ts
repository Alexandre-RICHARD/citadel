import type { TmdbIdCheckResultBean } from "../bean/tmdbIdCheckResultBean.type.ts";
import { tmdbCheckSliceSize } from "../helper/tmdbCheckSliceSize.ts";
import { countBacklogMediaQuery } from "../query/tmdbCheck/countBacklogMediaQuery.ts";
import { getTmdbIdsToCheckQuery } from "../query/tmdbCheck/getTmdbIdsToCheckQuery.ts";
import { markTmdbIdCheckedQuery } from "../query/tmdbCheck/markTmdbIdCheckedQuery.ts";
import { tmdbGateway } from "../tmdb/tmdbGateway.ts";

/**
 * L'écart « Identifiant TMDB disparu » (§5) : chaque nuit, le job media-tmdb fait relire un septième des médias des
 * backlogs, les moins récemment vérifiés d'abord. Les requêtes passent par le client TMDB, qui les espace (20 par
 * seconde au plus, sous la limite de TMDB). Une panne de TMDB arrête la vérification : le job échoue, et ce qui n'a
 * pas été relu le sera la nuit suivante
 */
export const tmdbIdCheckService = {
	async checkSlice(): Promise<TmdbIdCheckResultBean> {
		const refs = await getTmdbIdsToCheckQuery(
			tmdbCheckSliceSize(await countBacklogMediaQuery()),
		);
		let goneCount = 0;
		for (const ref of refs) {
			// eslint-disable-next-line no-await-in-loop -- une à la fois : le client TMDB les espace de toute façon
			const isGone = !(await tmdbGateway.isKnown(ref.mediaType, ref.tmdbId));
			// eslint-disable-next-line no-await-in-loop -- idem
			await markTmdbIdCheckedQuery(ref, isGone);
			if (isGone) goneCount += 1;
		}
		return { checkedCount: refs.length, goneCount };
	},
};
