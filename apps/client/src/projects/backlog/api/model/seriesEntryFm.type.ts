// Un jeu du backlog dans sa série
export type SeriesEntryFm = {
	gameId: number;
	seriesNumber: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
};
