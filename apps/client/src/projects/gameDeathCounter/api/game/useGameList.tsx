import { useSuspenseQuery } from "@tanstack/react-query";

import { fromGameListDtoToGameListFm } from "../model/fromGameListDtoToGameListFm";
import type { GameListFm } from "../model/gameListFm.type";
import { gameListQueryOptions } from "./gameListQueryOptions";

// Suspend jusqu'au chargement ; une erreur remonte au QueryErrorBoundary le plus proche
export function useGameList(): GameListFm {
	return useSuspenseQuery({
		...gameListQueryOptions,
		select: fromGameListDtoToGameListFm,
	}).data;
}
