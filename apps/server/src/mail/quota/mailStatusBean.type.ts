// Ce que le quota du jour laisse ouvert
export type MailStatusBean = {
	isRegistrationOpen: boolean;
	isContactOpen: boolean;
	// Tout le reste, connexion comprise
	isSendingOpen: boolean;
};
