import { describe, expect, it } from "vitest";

import { dropSeriesEntry } from "./dropSeriesEntry.ts";
import type { SeriesEntry } from "./seriesEntry.type.ts";

// Les jeux, nommés par une lettre : { A: 1, B: 2 } → entrées triées par numéro, id = rang de la lettre
const GAME_IDS: Readonly<Record<string, number>> = {
	A: 1,
	B: 2,
	C: 3,
	D: 4,
	E: 5,
	F: 6,
	G: 7,
	H: 8,
	I: 9,
	J: 10,
	X: 24,
};

function toEntries(numbers: Record<string, number>): SeriesEntry[] {
	return Object.entries(numbers).map(([name, seriesNumber]) => ({
		gameId: GAME_IDS[name] ?? 0,
		seriesNumber,
	}));
}

function drop(
	numbers: Record<string, number>,
	movedName: string,
	gapIndex: number,
	wantsSub = false,
): Record<string, number> {
	const placed = dropSeriesEntry(
		toEntries(numbers),
		GAME_IDS[movedName] ?? 0,
		gapIndex,
		wantsSub,
	);
	return Object.fromEntries(
		placed.map(({ gameId, seriesNumber }): [string, number] => [
			Object.keys(GAME_IDS).find((name) => GAME_IDS[name] === gameId) ?? "?",
			seriesNumber,
		]),
	);
}

describe("dropSeriesEntry.ts", () => {
	describe("main games", () => {
		it("SHOULD push the next games WHEN the last game is dropped between the first two", () => {
			expect(drop({ A: 1, B: 2, C: 3, D: 4, E: 5 }, "E", 1)).toStrictEqual({
				A: 1,
				E: 2,
				B: 3,
				C: 4,
				D: 5,
			});
		});

		it("SHOULD pull back the passed games WHEN a game moves down at the same level", () => {
			expect(drop({ A: 1, B: 2, C: 3, D: 4, E: 5 }, "B", 4)).toStrictEqual({
				A: 1,
				C: 2,
				D: 3,
				B: 4,
				E: 5,
			});
		});

		it("SHOULD take the first free number right after the game above", () => {
			expect(drop({ A: 1, B: 5, C: 6, D: 7 }, "D", 1)).toStrictEqual({
				A: 1,
				D: 2,
				B: 5,
				C: 6,
			});
		});

		it("SHOULD leave a hole WHEN the first game moves to a free number", () => {
			expect(drop({ A: 1, B: 2, C: 6 }, "A", 2)).toStrictEqual({
				B: 2,
				A: 3,
				C: 6,
			});
		});

		it("SHOULD give the next integer WHEN the game is dropped at the very bottom", () => {
			expect(drop({ A: 1, B: 2, C: 3 }, "A", 3)).toStrictEqual({
				B: 2,
				C: 3,
				A: 4,
			});
		});

		it("SHOULD stop shifting at the first hole", () => {
			expect(drop({ A: 1, B: 2, C: 3, D: 7, E: 8 }, "E", 1)).toStrictEqual({
				A: 1,
				E: 2,
				B: 3,
				C: 4,
				D: 7,
			});
		});

		it("SHOULD bring its sub-games along WHEN a main game moves to the top", () => {
			expect(drop({ A: 1, B: 2, C: 2.1, D: 2.2, E: 3 }, "B", 0)).toStrictEqual({
				B: 1,
				C: 1.1,
				D: 1.2,
				A: 2,
				E: 3,
			});
		});
	});

	describe("sub-games", () => {
		it("SHOULD become a sub-game and push the next ones WHEN dropped inside a family", () => {
			expect(
				drop({ A: 1, B: 2, C: 2.1, D: 2.2, E: 3, F: 4 }, "F", 2),
			).toStrictEqual({ A: 1, B: 2, F: 2.1, C: 2.2, D: 2.3, E: 3 });
		});

		it("SHOULD become a main game WHEN a sub-game is dropped with a full line", () => {
			expect(
				drop({ A: 1, B: 2, C: 2.1, D: 2.2, E: 3, F: 4 }, "C", 5),
			).toStrictEqual({ A: 1, B: 2, D: 2.2, E: 3, C: 4, F: 5 });
		});

		it("SHOULD widen the family to two digits WHEN its ninth rank is passed", () => {
			const family = {
				A: 3,
				B: 3.1,
				C: 3.2,
				D: 3.3,
				E: 3.4,
				F: 3.5,
				G: 3.6,
				H: 3.7,
				I: 3.8,
				J: 3.9,
				X: 4,
			};
			expect(drop(family, "X", 4)).toStrictEqual({
				A: 3,
				B: 3.01,
				C: 3.02,
				D: 3.03,
				X: 3.04,
				E: 3.05,
				F: 3.06,
				G: 3.07,
				H: 3.08,
				I: 3.09,
				J: 3.1,
			});
		});
	});
});
