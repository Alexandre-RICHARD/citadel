import { fetchCachedIgdbGameData } from "./fetchCachedIgdbGameData.ts";
import { fetchIgdbGameImages } from "./fetchIgdbGameImages.ts";
import { searchIgdbGames } from "./searchIgdbGames.ts";

/**
 * Ce que les services demandent à IGDB. Un objet plutôt que des imports directs : les tests d'intégration remplacent
 * ces trois méthodes (vi.spyOn) et ne contactent jamais IGDB
 */
export const igdbGateway = {
	searchGames: searchIgdbGames,
	fetchGameData: fetchCachedIgdbGameData,
	fetchGameImages: fetchIgdbGameImages,
};
