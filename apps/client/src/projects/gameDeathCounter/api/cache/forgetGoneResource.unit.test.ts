import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";
import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type";
import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameListDto.type";
import { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { ApiError } from "../../../../common/api/error/ApiError";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";
import { forgetGoneResource } from "./forgetGoneResource";

const GAME = {
	id: 1,
	name: "Elden Ring",
	startedAt: "2026-10-01T08:00:00.000Z",
	endedAt: null,
	totalDeath: 1,
};
const BOSS = {
	id: 3,
	name: "Margit",
	firstTry: null,
	lastTry: null,
	defeatedAt: null,
	totalDeath: 1,
};
const DEATH = { id: 7, date: "2026-10-01T20:00:00.000Z", comment: null };
const IDS = { gameId: 1, bossId: 3, deathId: 7 };

function setup() {
	const queryClient = new QueryClient();
	queryClient.setQueryData<GameListDto>(gameDeathCounterQueryKeys.gameList(), {
		games: [GAME],
	});
	queryClient.setQueryData<GameDto>(gameDeathCounterQueryKeys.game(1), {
		...GAME,
		bosses: [BOSS],
	});
	queryClient.setQueryData<BossDto>(gameDeathCounterQueryKeys.boss(3), {
		...BOSS,
		deaths: [DEATH],
	});
	return queryClient;
}

function notFound(code: GameDeathCounterErrorCodeEnum): ApiError {
	return new ApiError({ status: 404, code });
}

describe("forgetGoneResource.ts", () => {
	describe("gone game", () => {
		it("SHOULD remove the game from the list and drop its detail and its bosses", () => {
			// Arrange
			const queryClient = setup();

			// Act
			forgetGoneResource(
				queryClient,
				notFound(GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND),
				IDS,
			);

			// Assert
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.gameList()),
			).toStrictEqual({ games: [] });
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.game(1)),
			).toBeUndefined();
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.boss(3)),
			).toBeUndefined();
		});
	});

	describe("gone boss", () => {
		it("SHOULD remove the boss from its game and drop its detail", () => {
			// Arrange
			const queryClient = setup();

			// Act
			forgetGoneResource(
				queryClient,
				notFound(GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND),
				IDS,
			);

			// Assert
			expect(
				queryClient.getQueryData<GameDto>(gameDeathCounterQueryKeys.game(1))
					?.bosses,
			).toStrictEqual([]);
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.boss(3)),
			).toBeUndefined();
		});
	});

	describe("gone death", () => {
		it("SHOULD remove the death from its boss", () => {
			// Arrange
			const queryClient = setup();

			// Act
			forgetGoneResource(
				queryClient,
				notFound(GameDeathCounterErrorCodeEnum.DEATH_NOT_FOUND),
				IDS,
			);

			// Assert
			expect(
				queryClient.getQueryData<BossDto>(gameDeathCounterQueryKeys.boss(3))
					?.deaths,
			).toStrictEqual([]);
		});
	});
});
