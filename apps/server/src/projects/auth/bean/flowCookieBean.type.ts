// Ce qu'il faut pour poser le cookie d'un parcours : le jeton en clair (jamais gardé par le serveur) et la fin du parcours
export type FlowCookieBean = {
	token: string;
	expiresAt: Date;
};
