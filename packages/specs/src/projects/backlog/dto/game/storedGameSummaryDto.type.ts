// Un jeu de « Ma base », au même format qu'un résultat de recherche (cahier des charges, §8)
export type StoredGameSummaryDto = {
	id: number;
	name: string;
	frenchName: string | null;
	releaseYear: number | null;
	// Cover de la version originale
	coverImageId: string | null;
	// Plateformes de toutes ses versions
	platformNames: string[];
};
