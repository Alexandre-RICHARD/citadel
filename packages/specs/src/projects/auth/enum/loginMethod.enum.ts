// Méthodes de connexion qu'un compte accepte, choisies dans le profil
export enum LoginMethodEnum {
	// Lien ou code reçu par email
	MAIL = "mail",
	// Pseudo ou email, et mot de passe
	PASSWORD = "password",
	BOTH = "both",
}
