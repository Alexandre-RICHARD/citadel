// Erreur renvoyée par un appel à la base qu'un test fait échouer volontairement
export function simulatedDatabaseFailure(): Error {
	return new Error("Simulated database failure");
}
