const ROOT = "gameDeathCounter";

// Racines distinctes : invalider la liste ne touche pas au détail de chaque jeu (les clés se comparent par préfixe)
export const gameDeathCounterQueryKeys = {
	gameList: () => [ROOT, "gameList"] as const,
	game: (gameId: number) => [ROOT, "game", gameId] as const,
	boss: (bossId: number) => [ROOT, "boss", bossId] as const,
	// Une seule mutation à la fois par action et par élément
	mutation: (action: string, id?: number) =>
		id === undefined ? [ROOT, action] : [ROOT, action, id],
};
