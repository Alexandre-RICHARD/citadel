// Statut d'une version jouée (cahier des charges, §6), dans l'ordre de l'échelle : c'est aussi l'ordre de tri.
// Rangs et types de fin compatibles dans rule/status/
export enum StatusEnum {
	NOT_STARTED = "notStarted",
	WATCHED = "watched",
	STARTED = "started",
	WELL_UNDERWAY = "wellUnderway",
	FINISHED = "finished",
	DEEMED_FINISHED = "deemedFinished",
	COMPLETED = "completed",
	PLATINUM = "platinum",
	COMPLETED_AND_PLATINUM = "completedAndPlatinum",
	// Hors échelle
	ABANDONED = "abandoned",
}
