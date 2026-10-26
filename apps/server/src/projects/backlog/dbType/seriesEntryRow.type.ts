// Un jeu du backlog dans sa série, lu en SQL brut avec les noms et la date de sortie du jeu
export type SeriesEntryRow = {
	gameId: number;
	// DECIMAL : le pilote le rend en texte
	seriesNumber: string;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
};
