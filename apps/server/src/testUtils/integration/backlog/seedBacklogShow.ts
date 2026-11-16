import { insertMediaRows } from "./insertMediaRows.ts";
import { nextTmdbId } from "./nextTmdbId.ts";

type SeededShow = {
	tvShowId: number;
	seasonIds: number[];
	// Les épisodes de chaque saison, dans l'ordre des saisons données
	episodeIds: number[][];
};

/**
 * Une série en base, avec une saison par nombre d'épisodes donné (`[0, 3, 2]` : les spéciaux vides, puis deux saisons),
 * tous les épisodes diffusés le 1er janvier 2020 et de 50 minutes. Rien n'est dans un backlog
 */
export async function seedBacklogShow({
	name = "Dark",
	episodeCounts,
	isOngoing = false,
}: {
	name?: string;
	episodeCounts: number[];
	isOngoing?: boolean;
}): Promise<SeededShow> {
	const tvShowId = await nextTmdbId();
	await insertMediaRows.tvShow({ id: tvShowId, name, isOngoing });
	const seasonIds: number[] = [];
	const episodeIds: number[][] = [];
	for (const [seasonNumber, episodeCount] of episodeCounts.entries()) {
		// eslint-disable-next-line no-await-in-loop -- les ids se suivent, saison après saison
		const seasonId = await nextTmdbId();
		// eslint-disable-next-line no-await-in-loop -- idem
		await insertMediaRows.tvSeason({ id: seasonId, tvShowId, seasonNumber });
		const seasonEpisodeIds: number[] = [];
		for (
			let episodeNumber = 1;
			episodeNumber <= episodeCount;
			episodeNumber += 1
		) {
			// eslint-disable-next-line no-await-in-loop -- idem
			const episodeId = await nextTmdbId();
			// eslint-disable-next-line no-await-in-loop -- idem
			await insertMediaRows.tvEpisode({
				id: episodeId,
				tvSeasonId: seasonId,
				episodeNumber,
			});
			seasonEpisodeIds.push(episodeId);
		}
		seasonIds.push(seasonId);
		episodeIds.push(seasonEpisodeIds);
	}
	return { tvShowId, seasonIds, episodeIds };
}
