import { isAiredEpisode } from "@citadel/specs/src/projects/backlog/helper/media/isAiredEpisode.ts";

import type { EpisodeRefBean } from "../../bean/episodeRefBean.type.ts";
import { aggregateNas } from "./aggregateNas.ts";
import { describeEpisodeNas } from "./describeEpisodeNas.ts";
import type { NasDetailsBean } from "./nasDetailsBean.type.ts";
import type { ShowNasContext } from "./showNasContext.type.ts";

// La saison 0 réunit les épisodes spéciaux, sans relevé (§5)
const SPECIALS_SEASON_NUMBER = 0;

/**
 * Les colonnes du NAS d'une série, ou d'une saison quand on ne lui donne que ses épisodes : agrégées sur les épisodes
 * principaux déjà diffusés, comme sa progression. `withShowJellyfin` : la ligne de la série porte son élément et sa
 * collection Jellyfin ; une saison, ni l'un ni l'autre
 */
export function describeShowNas(
	context: ShowNasContext,
	episodes: Pick<
		EpisodeRefBean,
		"seasonNumber" | "episodeNumber" | "runtimeMinutes" | "airDate"
	>[],
	withShowJellyfin: boolean,
): NasDetailsBean {
	const show = context.index.shows.get(context.showTmdbId)?.show;
	return aggregateNas(
		episodes
			.filter(
				({ seasonNumber, airDate }) =>
					seasonNumber !== SPECIALS_SEASON_NUMBER &&
					isAiredEpisode(airDate, context.today),
			)
			.map((episode) => describeEpisodeNas(context, episode)),
		withShowJellyfin
			? {
					jellyfinItemId: show?.jellyfinItemId ?? null,
					jellyfinCollection: show?.jellyfinCollection ?? null,
				}
			: { jellyfinItemId: null, jellyfinCollection: null },
	);
}
