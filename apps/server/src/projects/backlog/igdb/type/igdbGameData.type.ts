import type { IgdbDlcGame } from "./igdbDlcGame.type.ts";
import type { IgdbOriginalGame } from "./igdbOriginalGame.type.ts";
import type { IgdbSkippedEntry } from "./igdbSkippedEntry.type.ts";
import type { IgdbVersionGame } from "./igdbVersionGame.type.ts";

// Tout ce qu'IGDB renvoie pour un jeu : de quoi prévisualiser la modale du jeu, puis l'enregistrer
export type IgdbGameData = {
	original: IgdbOriginalGame;
	// Toutes les versions, originale comprise
	versions: IgdbVersionGame[];
	// DLC et extensions de l'original et de toutes ses versions, sans packs ni mises à jour
	dlcs: IgdbDlcGame[];
	// Nom du `game_status` de l'original (« Cancelled »…)
	gameStatus: string | null;
	skippedEntries: IgdbSkippedEntry[];
};
