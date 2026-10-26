// Une ligne de résultat : un jeu trouvé sur IGDB, ou un jeu de « Ma base »
export type GameHitFm = {
	// id IGDB de la fiche trouvée ; pour « Ma base », l'id du jeu
	id: number;
	name: string;
	frenchName: string | null;
	// Fiche qui a fait trouver le jeu, affichée « via … »
	matchedName: string | null;
	releaseYear: number | null;
	coverImageId: string | null;
	platformNames: string[];
	// Jeu déjà en base : il mène à l'ajout au backlog plutôt qu'à la modale d'ajout
	storedGameId: number | null;
	isInBacklog: boolean;
};
