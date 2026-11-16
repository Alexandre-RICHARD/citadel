// Le mode connecté tel que la page l'utilise ; les adresses sont prêtes, sur le nom d'hôte de la page
export type NasStatusFm = {
	isAvailable: boolean;
	isUnlocked: boolean;
	surveyedAt: string | null;
	// Pour « Ouvrir dans Jellyfin » : null tant que le mode connecté est fermé
	jellyfin: { hostname: string; port: number; serverId: string | null } | null;
	// L'accueil de la console, où se lit le rapport du job
	consoleUrl: string | null;
};
