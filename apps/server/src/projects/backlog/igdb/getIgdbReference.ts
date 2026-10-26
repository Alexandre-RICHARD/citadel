import { igdbClient } from "./igdbClient.ts";
import type { IgdbReference } from "./type/igdbReference.type.ts";

type IgdbGameType = { id: number; type: string };
type IgdbGameStatus = { id: number; status: string };

// Lue une seule fois, puis gardée pour les appels suivants ; un échec est retenté au prochain appel
let reference: Promise<IgdbReference> | null = null;

// Noms des types de fiche et des statuts de sortie, par id : IGDB conseille de les lire plutôt que de les coder en dur
export function getIgdbReference(): Promise<IgdbReference> {
	reference ??= Promise.all([
		igdbClient.request<IgdbGameType[]>("game_types", "fields type; limit 50;"),
		igdbClient.request<IgdbGameStatus[]>(
			"game_statuses",
			"fields status; limit 50;",
		),
	])
		.then(([gameTypes, gameStatuses]) => ({
			gameTypes: new Map(gameTypes.map(({ id, type }) => [id, type])),
			gameStatuses: new Map(gameStatuses.map(({ id, status }) => [id, status])),
		}))
		.catch((error: unknown) => {
			reference = null;
			throw error;
		});
	return reference;
}
