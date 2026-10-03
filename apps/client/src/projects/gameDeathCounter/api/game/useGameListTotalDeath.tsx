import { useQuery } from "@tanstack/react-query";

import { fromGameListDtoToGameListFm } from "../model/fromGameListDtoToGameListFm";
import { gameListQueryOptions } from "./gameListQueryOptions";

// Pour l'en-tête, hors de la zone de la liste : null tant que la liste n'est pas là, sans suspendre ni lever d'erreur
export function useGameListTotalDeath(): number | null {
	return (
		useQuery({
			...gameListQueryOptions,
			select: (gameList) => fromGameListDtoToGameListFm(gameList).totalDeath,
		}).data ?? null
	);
}
