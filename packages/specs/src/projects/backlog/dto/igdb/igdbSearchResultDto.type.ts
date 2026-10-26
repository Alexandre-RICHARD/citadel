// Un jeu de base trouvé par la recherche IGDB
export type IgdbSearchResultDto = {
	igdbId: number;
	name: string;
	// null si introuvable ou identique au nom VO : un seul nom s'affiche
	frenchName: string | null;
	// Fiche qui a fait trouver le jeu (édition, bundle, DLC…) ; null s'il a été trouvé par son propre nom
	matchedName: string | null;
	releaseYear: number | null;
	coverImageId: string | null;
	// Abréviations IGDB, sinon noms
	platformNames: string[];
	// Jeu déjà en base : son id ; null sinon
	storedGameId: number | null;
	isInBacklog: boolean;
};
