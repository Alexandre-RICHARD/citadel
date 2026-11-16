const ROOT = "backlog";

/**
 * Racines distinctes : invalider une liste ne touche pas aux détails (les clés se comparent par préfixe).
 * `userGames()` et `userMediaLists()` sont les préfixes de toutes les vues de chaque tableau (tri, filtres) : une écriture
 * les met toutes à jour
 */
export const backlogQueryKeys = {
	// Le préfixe de toutes les lectures du projet : ses données supprimées depuis le profil quittent le cache
	all: () => [ROOT] as const,
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
	// ==== Films et séries ====
	userMediaLists: () => [ROOT, "userMedia"] as const,
	userMediaList: (viewParams: Record<string, string>) =>
		[ROOT, "userMedia", viewParams] as const,
	showSeasonsOfAll: () => [ROOT, "showSeasons"] as const,
	showSeasons: (userMediaId: number) =>
		[ROOT, "showSeasons", userMediaId] as const,
	tmdbSearches: () => [ROOT, "tmdbSearch"] as const,
	tmdbSearch: (query: string) => [ROOT, "tmdbSearch", query] as const,
	mediaPreview: (mediaType: string, tmdbId: number) =>
		[ROOT, "mediaPreview", mediaType, tmdbId] as const,
	mediaPosters: (mediaType: string, tmdbId: number) =>
		[ROOT, "mediaPosters", mediaType, tmdbId] as const,
	sagas: () => [ROOT, "sagas"] as const,
	sagaEntriesOfAll: () => [ROOT, "sagaEntries"] as const,
	sagaEntries: (sagaId: number) => [ROOT, "sagaEntries", sagaId] as const,
	mediaImport: () => [ROOT, "mediaImport"] as const,
	showUpdates: () => [ROOT, "showUpdates"] as const,
	// Mode connecté : son statut, les médias oubliés. Les lignes du tableau connecté sont une vue de userMediaLists, et
	// ses saisons gardent la clé showSeasons : les écritures les mettent à jour comme celles du mode classique
	nasStatus: () => [ROOT, "nasStatus"] as const,
	forgottenMedia: () => [ROOT, "forgottenMedia"] as const,
	// Une seule mutation à la fois par action et par élément
	mutation: (action: string, ...ids: (number | string)[]) => [
		ROOT,
		action,
		...ids,
	],
};
