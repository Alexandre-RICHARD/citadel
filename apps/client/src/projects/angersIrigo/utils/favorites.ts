/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { MAX_FAVORITES } from "../config";
import { STOP_GROUP_BY_STOP_ID } from "../data/stop-groups";
import type { Favorite } from "../types/favorite";

/** Clé du localStorage */
export const FAVORITES_STORAGE_KEY = "irigo-map:favorites";

export function isSameFavorite(a: Favorite, b: Favorite): boolean {
	return (
		a.stopId === b.stopId &&
		a.routeId === b.routeId &&
		a.directionId === b.directionId
	);
}

/** Retire le favori s'il y est, sinon l'ajoute à la fin, dans la limite de MAX_FAVORITES */
export function toggleFavorite(
	favorites: Favorite[],
	favorite: Favorite,
): Favorite[] {
	if (favorites.some((item) => isSameFavorite(item, favorite))) {
		return favorites.filter((item) => !isSameFavorite(item, favorite));
	}
	return favorites.length < MAX_FAVORITES
		? [...favorites, favorite]
		: favorites;
}

function readFavorite(stored: unknown): Favorite | undefined {
	if (typeof stored !== "object" || stored === null) {
		return undefined;
	}
	const { stopId, routeId, directionId } = stored as Record<string, unknown>;
	if (
		typeof stopId !== "string" ||
		typeof routeId !== "string" ||
		(directionId !== 0 && directionId !== 1)
	) {
		return undefined;
	}
	return { stopId, routeId, directionId };
}

/**
 * Reprend les favoris sauvegardés valides, sans doublon ni dépassement de MAX_FAVORITES.
 * Ceux dont l'arrêt n'existe plus (après `pnpm update-gtfs`) sont oubliés : l'id d'un arrêt
 * est celui de son premier quai.
 */
export function sanitizeFavorites(stored: unknown): Favorite[] {
	if (!Array.isArray(stored)) {
		return [];
	}
	const favorites: Favorite[] = [];
	for (const item of stored) {
		const favorite = readFavorite(item);
		if (
			favorite &&
			STOP_GROUP_BY_STOP_ID.get(favorite.stopId)?.id === favorite.stopId &&
			!favorites.some((existing) => isSameFavorite(existing, favorite))
		) {
			favorites.push(favorite);
		}
	}
	return favorites.slice(0, MAX_FAVORITES);
}
