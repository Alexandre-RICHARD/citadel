import { describe, expect, it } from "vitest";

import { fromGameDtoToGameFm } from "./fromGameDtoToGameFm";

describe("fromGameDtoToGameFm.ts", () => {
	describe("bosses", () => {
		it("SHOULD keep the bosses in creation order and flag defeated and optimistic ones", () => {
			const game = fromGameDtoToGameFm({
				id: 1,
				name: "Elden Ring",
				startedAt: "2026-10-01T08:00:00.000Z",
				endedAt: null,
				totalDeath: 3,
				bosses: [
					{
						id: 3,
						name: "Margit",
						firstTry: "2026-10-01T20:00:00.000Z",
						lastTry: "2026-10-02T21:00:00.000Z",
						defeatedAt: "2026-10-02T21:00:00.000Z",
						totalDeath: 3,
					},
					{
						id: -1,
						name: "Godrick",
						firstTry: null,
						lastTry: null,
						defeatedAt: null,
						totalDeath: 0,
					},
				],
			});

			expect(
				game.bosses.map(({ id, isDefeated, isTemporary }) => ({
					id,
					isDefeated,
					isTemporary,
				})),
			).toStrictEqual([
				{ id: 3, isDefeated: true, isTemporary: false },
				{ id: -1, isDefeated: false, isTemporary: true },
			]);
		});
	});
});
