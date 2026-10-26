import type { IgdbSearchGame } from "./igdbSearchGame.type.ts";

// Jeu de base trouvé par la recherche, et le nom de la fiche qui l'a fait trouver quand ce n'est pas la sienne
export type IgdbSearchHit = {
	game: IgdbSearchGame;
	matchedName: string | null;
};
