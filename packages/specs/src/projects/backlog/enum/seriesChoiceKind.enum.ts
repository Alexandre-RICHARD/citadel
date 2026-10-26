// Série choisie pour un jeu du backlog, à l'ajout au backlog ou par « Personnaliser » (cahier des charges, §8)
export enum SeriesChoiceKindEnum {
	// Celle proposée par IGDB, ou aucune s'il n'en propose pas
	PROPOSED = "proposed",
	// Une autre série de la base
	OTHER = "other",
	// Créée par le serveur ; un nom déjà pris, sans tenir compte des accents ni des majuscules, désigne la série existante
	NEW = "new",
	NONE = "none",
}
