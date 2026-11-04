// Les pages du compte
export enum AuthPathEnum {
	LOGIN = "/auth/login",
	REGISTER = "/auth/register",
	FORGOT_PASSWORD = "/auth/forgot-password",
	// Où mène le lien des mails
	VERIFY = "/auth/verify",
	PROFILE = "/auth/profile",
	// L'étape facultative qui suit l'inscription
	SECURE_ACCOUNT = "/auth/secure-account",
}
