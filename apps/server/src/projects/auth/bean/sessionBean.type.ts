// Une session ouverte du compte, telle qu'elle s'affiche dans le profil
export type SessionBean = {
	id: number;
	browser: string | null;
	system: string | null;
	ip: string;
	createdAt: Date;
	lastSeenAt: Date;
	expiresAt: Date;
	isCurrent: boolean;
};
