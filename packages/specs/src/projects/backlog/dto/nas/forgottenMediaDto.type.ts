import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";
import type { NasToolEnum } from "../../enum/nasTool.enum.ts";

/**
 * Un média du NAS absent du backlog (§5), une ligne par média avec les endroits où il est. `tmdbId` et `mediaType` :
 * de quoi ouvrir sa fiche pour l'ajouter ; null pour un dossier qu'aucun outil ne relie à TMDB, listé par son chemin
 */
export type ForgottenMediaDto = {
	tmdbId: number | null;
	mediaType: MediaTypeEnum | null;
	title: string | null;
	year: number | null;
	path: string | null;
	trackedBy: NasToolEnum | null;
	fileCount: number;
	sizeBytes: number;
	isInJellyfin: boolean;
	torrentCount: number;
};
