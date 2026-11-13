// Parcours en plusieurs étapes, chacun lié au navigateur qui l'a commencé
export enum FlowKindEnum {
	REGISTRATION = "registration",
	// Connexion par mot de passe, quand un second facteur est demandé
	LOGIN = "login",
	MAIL_LOGIN = "mail_login",
	PASSWORD_RESET = "password_reset",
	EMAIL_CHANGE = "email_change",
	// Activation du second facteur par email, confirmée par un premier code
	EMAIL_FACTOR = "email_factor",
}
