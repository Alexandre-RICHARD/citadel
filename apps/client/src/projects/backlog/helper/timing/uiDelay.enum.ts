// Délais de l'interface du Backlog, en millisecondes
export enum UiDelayEnum {
	// Saisie de recherche ou de filtre : une requête après la dernière frappe (IGDB : 4 requêtes par seconde)
	TYPING_DEBOUNCE = 300,
	// Mode édition : retour automatique en lecture seule sans activité
	EDIT_MODE_IDLE = 60_000,
}
