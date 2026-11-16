// Le mode connecté est-il là ? Voir NasStatusDto
export type NasStatusBean = {
	isAvailable: boolean;
	isUnlocked: boolean;
	surveyedAt: string | null;
	jellyfinServerId: string | null;
	jellyfinPort: number | null;
	consolePort: number | null;
};
