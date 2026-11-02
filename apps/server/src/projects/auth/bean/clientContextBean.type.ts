// D'où vient une requête : l'IP réelle (pas encore tronquée) et le user agent, s'il y en a un
export type ClientContextBean = {
	ip: string;
	userAgent: string | null;
};
