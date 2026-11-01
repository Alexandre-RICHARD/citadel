// /banner.json, écrit par infra-ops et servi par Caddy (cahier des charges de
// l'hébergement, §11.8). kind : restore (après une restauration) ou message (console)
export type SiteBanner = {
	id: string;
	kind: "restore" | "message";
	message: string;
	// Date ISO ; null : affiché jusqu'à ce qu'il soit retiré
	endsAt: string | null;
};
