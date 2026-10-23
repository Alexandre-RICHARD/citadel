/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { createContext, useContext } from "react";

import type { Favorite } from "../types/favorite";

export type FavoritesContextValue = {
	favorites: Favorite[];
	/** Ajoute le favori, ou le retire s'il y est déjà */
	onToggle: (favorite: Favorite) => void;
};

/**
 * Fourni par App : les popups d'arrêt, où qu'elles soient sur la carte (arrêts, tracé d'un
 * véhicule, arrêt recherché), lisent et modifient les favoris sans passer par chaque calque.
 */
export const FavoritesContext = createContext<FavoritesContextValue>({
	favorites: [],
	onToggle: () => undefined,
});

export function useFavorites(): FavoritesContextValue {
	return useContext(FavoritesContext);
}
