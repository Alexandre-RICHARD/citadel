// D'où vient une requête, pour la protection CSRF : chaque serveur décide lesquelles il refuse
export enum RequestOriginEnum {
	// GET, HEAD, OPTIONS : sans effet, jamais refusée
	SAFE_METHOD = "SAFE_METHOD",
	// En-tête Origin sur le même hôte que la requête : une page du site
	SAME_HOST = "SAME_HOST",
	// Pas d'en-tête Origin : un navigateur l'envoie toujours sur ces méthodes, un script (curl, job) non
	MISSING = "MISSING",
	// Un autre hôte, ou un Origin illisible (« null » d'un iframe isolé…)
	FOREIGN = "FOREIGN",
}
