// Taille des pages des listes paginées du Backlog : le front en déduit s'il reste une page à charger
export enum BacklogPageSizeEnum {
	// Défilement infini du tableau
	USER_GAMES = 25,
	// Défilement infini du tableau des films et séries
	USER_MEDIA = 40,
	// « Ma base »
	STORED_GAMES = 50,
}
