// Le bandeau du site (cahier des charges, §11.8), servi par Caddy en /banner.json.
// kind : restore (écrit après une restauration) ou message (écrit depuis la console)
export type SiteBanner = {
	id: string;
	kind: "restore" | "message";
	message: string;
	// Date ISO ; null : jusqu'à ce qu'on le retire
	endsAt: string | null;
};
