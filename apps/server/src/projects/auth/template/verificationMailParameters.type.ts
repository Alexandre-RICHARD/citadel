// Ce que chaque envoi apporte : le destinataire, le lien et le code du parcours, leur durée
export type VerificationMailParameters = {
	email: string;
	linkUrl: string;
	code: string;
	validityMinutes: number;
};
