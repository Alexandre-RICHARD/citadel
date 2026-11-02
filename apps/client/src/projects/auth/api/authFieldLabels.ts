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
};
