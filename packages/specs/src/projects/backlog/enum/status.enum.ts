// Statut d'une version jouée, dans l'ordre de l'échelle : c'est aussi l'ordre de tri. Le même pour tous les types de fin
// (« Fini » et « Complété » se lisent « Estimé » pour les types sans fin imposée, c'est le libellé qui change)
export enum StatusEnum {
	NOT_STARTED = "notStarted",
	ABANDONED = "abandoned",
	STARTED = "started",
	WELL_UNDERWAY = "wellUnderway",
	WATCHED = "watched",
	FINISHED = "finished",
	COMPLETED = "completed",
	PLATINUM = "platinum",
	COMPLETED_AND_PLATINUM = "completedAndPlatinum",
}
