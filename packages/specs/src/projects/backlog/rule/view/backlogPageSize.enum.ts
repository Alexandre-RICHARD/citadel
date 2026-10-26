// Taille des pages des listes paginées du Backlog : le front en déduit s'il reste une page à charger
export enum BacklogPageSizeEnum {
	// Défilement infini du tableau (cahier des charges, §9)
	USER_GAMES = 25,
	// « Ma base » (cahier des charges, §8)
	STORED_GAMES = 50,
}
