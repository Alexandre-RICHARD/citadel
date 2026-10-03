import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import { describe, expect, it } from "vitest";

import { fromGameListDtoToGameListFm } from "./fromGameListDtoToGameListFm";

function buildGame(id: number, name: string, totalDeath = 0): GameSummaryDto {
	return {
		id,
		name,
		startedAt: "2026-10-01T08:00:00.000Z",
		endedAt: null,
		totalDeath,
	};
}

describe("fromGameListDtoToGameListFm.ts", () => {
	describe("empty list", () => {
		it("SHOULD return no game and no death WHEN the API answered 204", () => {
			expect(fromGameListDtoToGameListFm(null)).toStrictEqual({
				games: [],
				totalDeath: 0,
			});
		});
	});

	describe("games", () => {
		it("SHOULD sort the games by name, ignoring case and accents", () => {
			const gameList = fromGameListDtoToGameListFm({
				games: [
					buildGame(1, "sekiro"),
					buildGame(2, "Élden Ring"),
					buildGame(3, "Bloodborne"),
				],
			});

			expect(gameList.games.map((game) => game.name)).toStrictEqual([
				"Bloodborne",
				"Élden Ring",
				"sekiro",
			]);
		});

		it("SHOULD flag a finished game and an optimistic one", () => {
			const [game] = fromGameListDtoToGameListFm({
				games: [
					{ ...buildGame(-1, "Hades"), endedAt: "2026-10-02T08:00:00.000Z" },
				],
			}).games;

			expect(game).toStrictEqual({
				id: -1,
				name: "Hades",
				startedAt: "2026-10-01T08:00:00.000Z",
				endedAt: "2026-10-02T08:00:00.000Z",
				totalDeath: 0,
				isFinished: true,
				isTemporary: true,
			});
		});
	});

	describe("total", () => {
		it("SHOULD add up the deaths of every game", () => {
			expect(
				fromGameListDtoToGameListFm({
					games: [buildGame(1, "Hades", 3), buildGame(2, "Celeste", 39)],
				}).totalDeath,
			).toBe(42);
		});
	});
});
