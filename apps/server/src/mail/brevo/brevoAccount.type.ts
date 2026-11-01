// La partie lue de GET /v3/account
export type BrevoAccount = {
	plan: {
		type: string;
		// Ce qu'il reste : des envois du jour pour le creditsType "sendLimit" de l'offre gratuite
		credits: number;
		creditsType: string;
	}[];
};
