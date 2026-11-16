import type { MediaRowFm } from "./mediaRowFm.type";

// Les lignes chargées du tableau des films et séries, et ce que le résumé et les filtres lisent de tout le backlog
export type MediaRowsFm = {
	rows: MediaRowFm[];
	matchedCount: number;
	movieCount: number;
	showCount: number;
	originalLanguages: string[];
};
