// Ce qu'infra-ops a fait de la recherche complète de cross-seed avant le relevé (§8, étape 1). Elle n'a lieu que la nuit
// du mardi au mercredi, et le job n'attend pas sa fin : ce qu'elle ajoute entre dans le relevé suivant
export enum CrossSeedSearchEnum {
	// Pas cette nuit
	NOT_SCHEDULED = "not_scheduled",
	STARTED = "started",
	// cross-seed en avait déjà une en cours
	ALREADY_RUNNING = "already_running",
	// cross-seed injoignable ou a refusé : le relevé a lieu quand même
	FAILED = "failed",
}
