// Une requête reçue par Caddy (son log d'accès)
export type AccessEntry = {
	// Date ISO
	at: string;
	// L'IP réelle du visiteur, même derrière Cloudflare
	ip: string;
	// Code pays donné par Cloudflare (FR, US…) ; null pour Jellyfin, hors Cloudflare
	country: string | null;
	method: string;
	host: string;
	path: string;
	status: number;
};
