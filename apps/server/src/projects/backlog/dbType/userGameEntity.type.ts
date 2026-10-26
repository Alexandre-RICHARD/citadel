import type { Company } from "../models/Company.ts";
import type { Game } from "../models/Game.ts";
import type { Series } from "../models/Series.ts";
import type { UserGame } from "../models/UserGame.ts";

// Jeu du backlog chargé avec son jeu (sociétés, série proposée) et sa série choisie ; ses DLC se lisent à part.
// Omit : les modèles déclarent ces relations facultatives
export type UserGameEntity = Omit<UserGame, "game" | "series"> & {
	game: Omit<Game, "developer" | "publisher" | "proposedSeries"> & {
		developer: Company | null;
		publisher: Company | null;
		proposedSeries: Series | null;
	};
	series: Series | null;
};
