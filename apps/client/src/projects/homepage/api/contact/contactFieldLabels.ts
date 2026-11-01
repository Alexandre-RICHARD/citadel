// Nom de chaque champ du formulaire de contact, pour les erreurs de saisie : « le sujet doit contenir au moins 1 caractère »
export const contactFieldLabels: Readonly<Record<string, string>> = {
	subject: "le sujet",
	message: "le message",
	email: "l'adresse mail",
	name: "le nom",
	website: "le champ caché",
};
