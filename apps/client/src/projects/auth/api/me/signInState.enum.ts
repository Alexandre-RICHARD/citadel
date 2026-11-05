// Ce que le site sait de la connexion du navigateur
export enum SignInStateEnum {
	// GET /auth/me n'a pas encore répondu
	PENDING = "pending",
	SIGNED_IN = "signedIn",
	SIGNED_OUT = "signedOut",
	// GET /auth/me a échoué (serveur injoignable, erreur 500) : personne ne sait
	UNKNOWN = "unknown",
}
