// Codes d'erreur communs à tous les projets, indépendants du métier.
// Le front traduit le code ; le message de la réponse reste un détail technique pour le développeur
export enum TechnicalErrorCodeEnum {
	// Corps, path params ou query params refusés par un schéma zod
	VALIDATION_FAILED = "VALIDATION_FAILED",
	// Corps JSON illisible, refusé par express.json avant toute validation
	MALFORMED_JSON = "MALFORMED_JSON",
	// Autre requête refusée avant tout traitement (corps trop volumineux, encodage non supporté…)
	INVALID_REQUEST = "INVALID_REQUEST",
	ROUTE_NOT_FOUND = "ROUTE_NOT_FOUND",
	METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
	INTERNAL_ERROR = "INTERNAL_ERROR",
}
