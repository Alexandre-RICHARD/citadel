// Le temps de réponse d'un endpoint de l'API sur la période, vu par Caddy : réseau compris, du premier au dernier octet
export type EndpointTiming = {
	// Méthode et chemin sans paramètres, les numéros remplacés : « GET /api/backlog/user-games/:id »
	endpoint: string;
	requestCount: number;
	medianMs: number;
	// 95 % des requêtes ont répondu en moins que cela : le temps que l'on subit de temps en temps
	p95Ms: number;
	maxMs: number;
};
