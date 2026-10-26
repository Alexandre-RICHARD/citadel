import { igdbClient } from "./igdbClient.ts";
import type { IgdbGameImages } from "./type/igdbGameImages.type.ts";

// Images d'un jeu, une seule requête ; null si la fiche n'existe pas sur IGDB
export async function fetchIgdbGameImages(
	igdbId: number,
): Promise<IgdbGameImages | null> {
	const games = await igdbClient.request<IgdbGameImages[]>(
		"games",
		`fields cover.image_id, artworks.image_id; where id = ${igdbId};`,
	);
	return games.at(0) ?? null;
}
