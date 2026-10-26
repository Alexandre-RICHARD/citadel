import type { BacklogRowFm } from "./backlogRowFm.type";

// Les pages du tableau déjà chargées, mises bout à bout
export type BacklogRowsFm = {
	rows: BacklogRowFm[];
	// Jeux qui correspondent aux filtres, toutes pages confondues
	matchedCount: number;
};
