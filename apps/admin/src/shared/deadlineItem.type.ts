// Une échéance (§14.3, fonctionnalité 8) : certificat, token, clé…
export type DeadlineItem = {
	label: string;
	// Date ISO ; null : n'expire jamais, ou date illisible (alors problem le dit)
	expiresAt: string | null;
	// Ce qui ne va pas (token refusé, Caddy injoignable…) ; null si tout va bien
	problem: string | null;
};
