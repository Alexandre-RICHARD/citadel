// Étape où en est un parcours
export enum FlowStepEnum {
	// Lien ou code envoyé par email
	MAIL_CODE = "mail_code",
	// TOTP, code par email ou code de secours
	SECOND_FACTOR = "second_factor",
	// Mot de passe oublié : le nouveau, deux fois
	NEW_PASSWORD = "new_password",
}
