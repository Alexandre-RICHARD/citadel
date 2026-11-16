// Ce qu'une série a de nouveau sur TMDB : « 1 nouvelle saison · 8 nouveaux épisodes »
export function describeShowNews(
	newSeasonCount: number,
	newEpisodeCount: number,
): string {
	const parts: string[] = [];
	if (newSeasonCount > 0)
		parts.push(
			newSeasonCount > 1
				? `${newSeasonCount} nouvelles saisons`
				: "1 nouvelle saison",
		);
	if (newEpisodeCount > 0)
		parts.push(
			newEpisodeCount > 1
				? `${newEpisodeCount} nouveaux épisodes`
				: "1 nouvel épisode",
		);
	return parts.join(" · ");
}
