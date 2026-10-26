import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum";
import type { QueryClient } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { removeCachedUserGame } from "./removeCachedUserGame";

/**
 * 404 métier : le jeu a quitté le backlog ou la base ailleurs (autre onglet). Sa ligne est retirée au lieu d'annuler la
 * mise à jour optimiste ; une version jouée disparue se corrige à la resynchronisation qui suit la mutation
 */
export function forgetGoneUserGame(
	queryClient: QueryClient,
	error: ApiError,
	gameId: number,
): void {
	if (
		error.code === BacklogErrorCodeEnum.USER_GAME_NOT_FOUND ||
		error.code === BacklogErrorCodeEnum.GAME_NOT_FOUND
	)
		removeCachedUserGame(queryClient, gameId);
}
