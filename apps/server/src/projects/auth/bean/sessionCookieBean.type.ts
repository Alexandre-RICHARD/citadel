// Ce qu'il faut pour poser le cookie d'une session : le jeton en clair (jamais gardé par le serveur) et sa fin
export type SessionCookieBean = {
	token: string;
	remember: boolean;
	expiresAt: Date;
};
