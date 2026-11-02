// La session valide d'une requête. isProlonged : sa fin vient d'être repoussée, le cookie est à renvoyer
export type AuthenticatedSessionBean = {
	sessionId: number;
	userId: number;
	remember: boolean;
	expiresAt: Date;
	isProlonged: boolean;
};
