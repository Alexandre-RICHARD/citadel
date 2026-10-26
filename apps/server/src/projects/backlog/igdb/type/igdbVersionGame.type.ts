import type { IgdbPlatform } from "./igdbPlatform.type.ts";

// Détail d'une version, originale comprise
export type IgdbVersionGame = {
	id: number;
	name: string;
	version_title?: string;
	// Nom du type, lu via IGDB : titre d'une version sans titre propre
	game_type?: { type: string };
	cover?: { image_id: string };
	url: string;
	platforms?: IgdbPlatform[];
	// `date` : timestamp Unix en secondes, absent si la date est inconnue
	release_dates?: { date?: number; platform?: number }[];
	dlcs?: number[];
	expansions?: number[];
};
