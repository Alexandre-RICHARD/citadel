/**
 * Le mode connecté est-il là ? `isAvailable` : sur l'instance locale du NAS, pour le compte de son propriétaire ;
 * toujours faux sur le serveur public. `isUnlocked` : le mot de passe des médias a été donné il y a moins de 12 h.
 * `surveyedAt` : la date du dernier relevé du job, affichée en haut du tableau. Les ports servent aux liens vers Jellyfin
 * et vers le rapport de la console, sur le nom d'hôte par lequel la page a été ouverte
 */
export type NasStatusDto = {
	isAvailable: boolean;
	isUnlocked: boolean;
	surveyedAt: string | null;
	jellyfinServerId: string | null;
	jellyfinPort: number | null;
	consolePort: number | null;
};
