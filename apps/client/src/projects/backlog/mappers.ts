/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont mappers.ts pour tous les mappers */
import type { IgdbSearchGame, SearchResult } from "./types";
import { trimToNull } from "./utils";

/**
 * Nom VF. IGDB n'a pas de région France (seulement EU, ja-JP, ko-KR) : on prend le titre
 * des noms alternatifs commenté « French », sinon le nom de la localisation EU (nom européen).
 * `null` si introuvable ou identique au nom VO : un seul nom s'affiche.
 */
export function findFrenchName(
	game: Pick<
		IgdbSearchGame,
		"name" | "alternative_names" | "game_localizations"
	>,
): string | null {
	const frenchTitle = game.alternative_names?.find(({ comment }) =>
		comment?.toLowerCase().includes("french"),
	)?.name;
	const europeanName = game.game_localizations?.find(
		({ region }) => region?.identifier === "EU",
	)?.name;
	const frenchName = trimToNull(frenchTitle) ?? trimToNull(europeanName);
	if (
		frenchName === null ||
		frenchName.toLowerCase() === game.name.toLowerCase()
	) {
		return null;
	}
	return frenchName;
}

export function mapSearchResult(game: IgdbSearchGame): SearchResult {
	return {
		id: game.id,
		name: game.name,
		frenchName: findFrenchName(game),
		releaseYear:
			game.first_release_date === undefined
				? null
				: new Date(game.first_release_date * 1000).getUTCFullYear(),
		coverImageId: game.cover?.image_id ?? null,
	};
}
