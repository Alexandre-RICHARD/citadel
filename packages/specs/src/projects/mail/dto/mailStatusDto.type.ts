// Ce que le quota quotidien de mails laisse ouvert aujourd'hui ; tout rouvre quand le fournisseur remet son compteur à zéro
export type MailStatusDto = {
	isRegistrationOpen: boolean;
	isContactOpen: boolean;
	// Tout le reste, connexion comprise
	isSendingOpen: boolean;
};
