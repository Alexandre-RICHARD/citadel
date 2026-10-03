// Nom de chaque champ des corps de requête, pour les erreurs de saisie : « le nom doit contenir au plus 255 caractères »
export const gameDeathCounterFieldLabels: Readonly<Record<string, string>> = {
	name: "le nom",
	date: "la date",
	comment: "le commentaire",
	finished: "le statut",
	defeated: "le statut",
	gameId: "le jeu",
};
