import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum";

// Raisons des codes métier, après « Impossible de … : »
export const gameDeathCounterErrorReasons: Record<
	GameDeathCounterErrorCodeEnum,
	string
> = {
	[GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND]: "ce jeu n'existe plus",
	[GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND]: "ce boss n'existe plus",
	[GameDeathCounterErrorCodeEnum.DEATH_NOT_FOUND]: "cette mort n'existe plus",
};
