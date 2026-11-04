// Une session ouverte du compte. Dates ISO 8601, à afficher ; navigateur et système sont déduits de son user agent
export type SessionDto = {
	id: number;
	// null : user agent absent ou inconnu
	browser: string | null;
	system: string | null;
	// Tronquée : /24 en IPv4, /48 en IPv6
	ip: string;
	createdAt: string;
	lastSeenAt: string;
	// La fin prévue si elle reste sans activité (jamais au-delà du plafond de 30 jours)
	expiresAt: string;
	// La session de la requête
	isCurrent: boolean;
};
