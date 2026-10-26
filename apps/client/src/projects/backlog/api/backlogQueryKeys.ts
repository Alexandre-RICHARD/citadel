const ROOT = "backlog";

/**
 * Racines distinctes : invalider une liste ne touche pas aux détails (les clés se comparent par préfixe).
 * `userGames()` est le préfixe de toutes les vues du tableau (tri, filtres) : une écriture les met toutes à jour
 */
export const backlogQueryKeys = {
	overview: () => [ROOT, "overview"] as const,
	userGames: () => [ROOT, "userGames"] as const,
	userGameList: (viewParams: Record<string, string>) =>
		[ROOT, "userGames", viewParams] as const,
	storedGames: () => [ROOT, "storedGames"] as const,
	storedGameList: (query: string) => [ROOT, "storedGames", query] as const,
	storedGame: (gameId: number) => [ROOT, "storedGame", gameId] as const,
	igdbSearches: () => [ROOT, "igdbSearch"] as const,
	igdbSearch: (query: string) => [ROOT, "igdbSearch", query] as const,
	gamePreview: (igdbId: number) => [ROOT, "gamePreview", igdbId] as const,
	gameImages: (igdbId: number) => [ROOT, "gameImages", igdbId] as const,
	allSeries: () => [ROOT, "allSeries"] as const,
	seriesEntriesOfAll: () => [ROOT, "seriesEntries"] as const,
	seriesEntries: (seriesId: number) =>
		[ROOT, "seriesEntries", seriesId] as const,
	// Une seule mutation à la fois par action et par élément
	mutation: (action: string, ...ids: (number | string)[]) => [
		ROOT,
		action,
		...ids,
	],
};
