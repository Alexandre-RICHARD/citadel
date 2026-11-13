// Codes d'erreur métier de l'authentification
export enum AuthErrorCodeEnum {
	// 401 d'une connexion : identifiant inconnu et mauvais mot de passe donnent le même code. Une erreur de formulaire,
	// jamais une redirection
	INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
	// Inscriptions fermées par l'interrupteur ou par le quota quotidien d'emails
	REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
	// Plus aucun email ne part aujourd'hui : les parcours qui en envoient sont fermés
	MAIL_CLOSED = "MAIL_CLOSED",
	// Le nouveau mot de passe est l'actuel
	PASSWORD_UNCHANGED = "PASSWORD_UNCHANGED",
	// La nouvelle adresse email est celle du compte
	EMAIL_UNCHANGED = "EMAIL_UNCHANGED",
	// Code faux, déjà utilisé ou remplacé par un renvoi
	INVALID_CODE = "INVALID_CODE",
	// Tous les essais du code sont faits : seul un nouveau email en redonne
	CODE_ATTEMPTS_EXHAUSTED = "CODE_ATTEMPTS_EXHAUSTED",
	// Le lien a été ouvert dans un autre navigateur que celui du parcours : il faut y saisir le code
	LINK_OTHER_BROWSER = "LINK_OTHER_BROWSER",
	// Parcours expiré ou abandonné : il faut recommencer
	FLOW_EXPIRED = "FLOW_EXPIRED",
	USERNAME_TAKEN = "USERNAME_TAKEN",
	EMAIL_TAKEN = "EMAIL_TAKEN",
	// Délai entre deux essais, ou bannissement temporaire : Retry-After dit quand réessayer, en secondes
	TOO_MANY_ATTEMPTS = "TOO_MANY_ATTEMPTS",
	// Trop de mots de passe à vérifier en même temps : Retry-After dit quand réessayer, en secondes
	AUTH_BUSY = "AUTH_BUSY",
	// Le mot de passe redemandé avant une action sensible est faux. Un 400 : connecté, un 401 voudrait dire « plus de
	// session »
	WRONG_PASSWORD = "WRONG_PASSWORD",
	// Aucun facteur de ce compte sous cet id (jamais celui d'un autre), ou un TOTP qui n'attend plus son premier code
	FACTOR_NOT_FOUND = "FACTOR_NOT_FOUND",
	// Le compte a déjà son facteur email : il n'en a qu'un
	EMAIL_FACTOR_ALREADY_ACTIVE = "EMAIL_FACTOR_ALREADY_ACTIVE",
	// Codes de secours demandés sans aucun second facteur : ils n'auraient rien à secourir
	NO_SECOND_FACTOR = "NO_SECOND_FACTOR",
	// Le compte a une application d'authentification, et l'action sensible n'en a pas reçu de code
	SECOND_FACTOR_REQUIRED = "SECOND_FACTOR_REQUIRED",
	// Aucune session de ce compte sous cet id (jamais celle d'un autre)
	SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
}
