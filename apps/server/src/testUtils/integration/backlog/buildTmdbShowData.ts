import type { TmdbShowData } from "../../../projects/backlog/tmdb/type/tmdbShowData.type.ts";
import { nextTmdbId } from "./nextTmdbId.ts";

type SeasonPlan = {
	// Date de diffusion de chaque épisode ; null : pas encore connue
	airDates: (string | null)[];
};

/**
 * Une fiche de série telle que la passerelle TMDB la rend, une saison par plan (la première est la saison 0 des
 * spéciaux si `withSpecials`), avec des ids TMDB jamais utilisés. Chaque épisode dure 50 minutes
 */
export async function buildTmdbShowData({
	name = "Dark",
	isOngoing = false,
	withSpecials = false,
	seasons,
}: {
	name?: string;
	isOngoing?: boolean;
	withSpecials?: boolean;
	seasons: SeasonPlan[];
}): Promise<TmdbShowData> {
	const id = await nextTmdbId();
	const builtSeasons: TmdbShowData["seasons"] = [];
	for (const [index, { airDates }] of seasons.entries()) {
		const seasonNumber = withSpecials ? index : index + 1;
		// eslint-disable-next-line no-await-in-loop -- les ids se suivent, saison après saison
		const seasonId = await nextTmdbId();
		const episodes: TmdbShowData["seasons"][number]["episodes"] = [];
		for (const [position, airDate] of airDates.entries())
			episodes.push({
				// eslint-disable-next-line no-await-in-loop -- idem
				id: await nextTmdbId(),
				episodeNumber: position + 1,
				name: `Épisode ${position + 1}`,
				airDate,
				runtimeMinutes: 50,
				stillPath: null,
			});
		builtSeasons.push({
			id: seasonId,
			seasonNumber,
			name: seasonNumber === 0 ? "Épisodes spéciaux" : `Saison ${seasonNumber}`,
			airDate: airDates[0] ?? null,
			posterPath: null,
			episodes,
		});
	}
	return {
		id,
		name,
		originalName: name,
		originalLanguage: "de",
		firstAirDate: "2017-12-01",
		imdbId: null,
		posterPath: "/dark.jpg",
		isOngoing,
		seasons: builtSeasons,
	};
}
