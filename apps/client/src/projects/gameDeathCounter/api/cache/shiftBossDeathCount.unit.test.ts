import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";
import type { GameDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameDto.type";
import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameListDto.type";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";
import { shiftBossDeathCount } from "./shiftBossDeathCount";

const GAME = {
	id: 1,
	name: "Elden Ring",
	startedAt: "2026-10-01T08:00:00.000Z",
	endedAt: null,
	totalDeath: 5,
};
const BOSS = {
	id: 3,
	name: "Margit",
	firstTry: null,
	lastTry: null,
	defeatedAt: null,
	totalDeath: 2,
};
const OTHER_BOSS = { ...BOSS, id: 4, name: "Godrick", totalDeath: 3 };

describe("shiftBossDeathCount.ts", () => {
	describe("loaded caches", () => {
		it("SHOULD move the boss total and its game total everywhere they are cached", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData<GameListDto>(
				gameDeathCounterQueryKeys.gameList(),
				{
					games: [GAME],
				},
			);
			queryClient.setQueryData<GameDto>(gameDeathCounterQueryKeys.game(1), {
				...GAME,
				bosses: [BOSS, OTHER_BOSS],
			});
			queryClient.setQueryData<BossDto>(gameDeathCounterQueryKeys.boss(3), {
				...BOSS,
				deaths: [],
			});

			// Act
			shiftBossDeathCount(queryClient, { gameId: 1, bossId: 3 }, 1);

			// Assert
			expect(
				queryClient.getQueryData<GameListDto>(
					gameDeathCounterQueryKeys.gameList(),
				)?.games[0]?.totalDeath,
			).toBe(6);
			const game = queryClient.getQueryData<GameDto>(
				gameDeathCounterQueryKeys.game(1),
			);
			expect(game?.totalDeath).toBe(6);
			expect(game?.bosses.map((boss) => boss.totalDeath)).toStrictEqual([3, 3]);
			expect(
				queryClient.getQueryData<BossDto>(gameDeathCounterQueryKeys.boss(3))
					?.totalDeath,
			).toBe(3);
		});
	});

	describe("missing caches", () => {
		it("SHOULD create nothing WHEN the game and the boss were never expanded", () => {
			// Arrange
			const queryClient = new QueryClient();
			queryClient.setQueryData(gameDeathCounterQueryKeys.gameList(), null);

			// Act
			shiftBossDeathCount(queryClient, { gameId: 1, bossId: 3 }, -1);

			// Assert
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.game(1)),
			).toBeUndefined();
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.boss(3)),
			).toBeUndefined();
			expect(
				queryClient.getQueryData(gameDeathCounterQueryKeys.gameList()),
			).toStrictEqual({ games: [] });
		});
	});
});
