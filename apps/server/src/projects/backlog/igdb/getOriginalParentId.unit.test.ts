import { describe, expect, it } from "vitest";

import { getOriginalParentId } from "./getOriginalParentId.ts";
import { IgdbGameTypeNameEnum } from "./igdbGameTypeName.enum.ts";

const REFERENCE = {
	gameTypes: new Map([
		[0, IgdbGameTypeNameEnum.MAIN_GAME],
		[8, IgdbGameTypeNameEnum.REMAKE],
		[9, IgdbGameTypeNameEnum.REMASTER],
		[11, IgdbGameTypeNameEnum.PORT],
	]),
	gameStatuses: new Map<number, string>(),
};

describe("getOriginalParentId.ts", () => {
	describe("parents leading to the original", () => {
		it("SHOULD follow version_parent WHEN the game is an edition", () => {
			expect(
				getOriginalParentId(REFERENCE, { game_type: 0, version_parent: 5 }),
			).toBe(5);
		});

		it.each([
			{ type: "remaster", gameType: 9 },
			{ type: "port", gameType: 11 },
		])("SHOULD follow parent_game WHEN the game is a $type", ({ gameType }) => {
			expect(
				getOriginalParentId(REFERENCE, { game_type: gameType, parent_game: 7 }),
			).toBe(7);
		});
	});

	describe("standalone games", () => {
		it("SHOULD stop WHEN a remake points to its parent game", () => {
			expect(
				getOriginalParentId(REFERENCE, { game_type: 8, parent_game: 7 }),
			).toBeUndefined();
		});

		it("SHOULD stop WHEN the game has no parent", () => {
			expect(getOriginalParentId(REFERENCE, { game_type: 0 })).toBeUndefined();
		});
	});
});
