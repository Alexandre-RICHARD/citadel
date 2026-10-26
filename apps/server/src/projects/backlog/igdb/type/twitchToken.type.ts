// Réponse de Twitch à une demande de token d'application (client credentials)
export type TwitchToken = {
	access_token: string;
	// En secondes
	expires_in: number;
	token_type: string;
};
