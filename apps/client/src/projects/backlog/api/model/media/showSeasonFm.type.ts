import type { NasDetailsFm } from "../nas/nasDetailsFm.type";
import type { ShowEpisodeFm } from "./showEpisodeFm.type";

// Une saison, sous-ligne de sa série, avec sa progression sur ses épisodes diffusés
export type ShowSeasonFm = {
	seasonId: number;
	seasonNumber: number;
	name: string;
	// « Épisodes spéciaux » : hors des saisons principales, des cascades de la série et de sa progression
	isSpecials: boolean;
	airDate: string | null;
	posterPath: string | null;
	runtimeMinutes: number | null;
	watchedEpisodeCount: number;
	airedEpisodeCount: number;
	// Vue quand tous ses épisodes diffusés le sont
	isWatched: boolean;
	episodes: ShowEpisodeFm[];
	// Mode connecté : ses colonnes du NAS ; null en mode classique et pour les épisodes spéciaux
	nas: NasDetailsFm | null;
};
