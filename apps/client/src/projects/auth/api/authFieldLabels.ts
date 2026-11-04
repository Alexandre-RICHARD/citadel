// Nom de chaque champ des formulaires de l'authentification, pour les erreurs de saisie : « le pseudo doit contenir… »
export const authFieldLabels: Readonly<Record<string, string>> = {
	email: "l'adresse email",
	username: "le pseudo",
	password: "le mot de passe",
	identifier: "l'email ou le pseudo",
	code: "le code",
	token: "le lien",
	remember: "« Se souvenir de moi »",
	website: "le champ caché",
	displayName: "le pseudo affiché",
	newEmail: "la nouvelle adresse email",
	currentPassword: "le mot de passe actuel",
	newPassword: "le nouveau mot de passe",
	name: "le nom",
	secondFactor: "le second facteur",
};
