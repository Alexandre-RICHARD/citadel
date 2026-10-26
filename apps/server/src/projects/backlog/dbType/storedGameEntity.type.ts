import type { Company } from "../models/Company.ts";
import type { Dlc } from "../models/Dlc.ts";
import type { Game } from "../models/Game.ts";
import type { Series } from "../models/Series.ts";
import type { UserGame } from "../models/UserGame.ts";
import type { StoredVersionEntity } from "./storedVersionEntity.type.ts";

// Jeu chargé avec tout ce qu'en montre la base ; Omit : le modèle déclare ces relations facultatives
export type StoredGameEntity = Omit<
	Game,
	| "proposedSeries"
	| "developer"
	| "publisher"
	| "versions"
	| "dlcs"
	| "userGame"
> & {
	proposedSeries: Series | null;
	developer: Company | null;
	publisher: Company | null;
	versions: StoredVersionEntity[];
	dlcs: Dlc[];
	userGame: (Omit<UserGame, "series"> & { series: Series | null }) | null;
};
