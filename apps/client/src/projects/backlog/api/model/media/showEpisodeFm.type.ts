import type { NasDetailsFm } from "../nas/nasDetailsFm.type";

// Un épisode, sous-ligne de sa saison
export type ShowEpisodeFm = {
	episodeId: number;
	episodeNumber: number;
	name: string;
	airDate: string | null;
	runtimeMinutes: number | null;
	stillPath: string | null;
	isWatched: boolean;
	// Date passée ou du jour : les autres restent hors de la progression et des cascades
	isAired: boolean;
	// Mode connecté : ses colonnes du NAS ; null en mode classique et pour un épisode spécial
	nas: NasDetailsFm | null;
};
