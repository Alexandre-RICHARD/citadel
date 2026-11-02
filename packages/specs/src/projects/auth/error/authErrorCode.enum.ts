// Codes d'erreur métier de l'authentification
export enum AuthErrorCodeEnum {
	// 401 d'un endpoint protégé : pas de session valide. Le front vide son cache et renvoie vers la connexion
	AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
	// 401 d'une connexion : identifiant inconnu et mauvais mot de passe donnent le même code. Une erreur de formulaire,
	// jamais une redirection
	INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
	// Inscriptions fermées par l'interrupteur ou par le quota quotidien de mails
	REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
	// Plus aucun mail ne part aujourd'hui : les parcours qui en envoient sont fermés
	MAIL_CLOSED = "MAIL_CLOSED",
	// Le nouveau mot de passe est l'actuel
	PASSWORD_UNCHANGED = "PASSWORD_UNCHANGED",
	// Code faux, déjà utilisé ou remplacé par un renvoi
	INVALID_CODE = "INVALID_CODE",
	// Parcours expiré ou abandonné : il faut recommencer
	FLOW_EXPIRED = "FLOW_EXPIRED",
	USERNAME_TAKEN = "USERNAME_TAKEN",
	EMAIL_TAKEN = "EMAIL_TAKEN",
	// Délai entre deux essais, ou bannissement temporaire : Retry-After dit quand réessayer, en secondes
	TOO_MANY_ATTEMPTS = "TOO_MANY_ATTEMPTS",
	// Trop de mots de passe à vérifier en même temps : Retry-After dit quand réessayer, en secondes
	AUTH_BUSY = "AUTH_BUSY",
}
