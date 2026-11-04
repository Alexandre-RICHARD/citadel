// Une session ouverte du compte, ses dates en heure du navigateur (millisecondes)
export type SessionFm = {
	id: number;
	// null : navigateur ou système non reconnu
	browser: string | null;
	system: string | null;
	ip: string;
	createdAt: number;
	lastSeenAt: number;
	// La fin prévue si elle reste sans activité
	expiresAt: number;
	// La session de ce navigateur
	isCurrent: boolean;
};
