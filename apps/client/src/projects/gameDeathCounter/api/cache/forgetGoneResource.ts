import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum";
import type { QueryClient } from "@tanstack/react-query";

import { removeById } from "../../../../common/api/cache/removeById";
import type { ApiError } from "../../../../common/api/error/ApiError";
import { forgetBoss } from "./forgetBoss";
import { forgetGame } from "./forgetGame";
import { updateCachedBoss } from "./updateCachedBoss";

// Éléments visés par la mutation : le code du 404 dit lequel a disparu
type Ids = { gameId: number; bossId?: number; deathId?: number };

/**
 * 404 métier : la ressource a été supprimée ailleurs (autre onglet, autre appareil). On la retire au lieu d'annuler la
 * mise à jour optimiste. Les totaux de morts se corrigent à la resynchronisation qui suit la mutation
 */
export function forgetGoneResource(
	queryClient: QueryClient,
	error: ApiError,
	{ gameId, bossId, deathId }: Ids,
): void {
	switch (error.code) {
		case GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND:
			forgetGame(queryClient, gameId);
			break;
		case GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND:
			if (bossId !== undefined) forgetBoss(queryClient, { gameId, bossId });
			break;
		case GameDeathCounterErrorCodeEnum.DEATH_NOT_FOUND:
			if (bossId !== undefined && deathId !== undefined)
				updateCachedBoss(queryClient, bossId, (boss) => ({
					...boss,
					deaths: removeById(boss.deaths, deathId),
				}));
			break;
		default:
	}
}
