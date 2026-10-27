import { describe, expect, it } from "vitest";

import { getGameTypeName } from "./getGameTypeName.ts";

const REFERENCE = {
	gameTypes: new Map([[0, "Main Game"]]),
	gameStatuses: new Map<number, string>(),
};

describe("getGameTypeName.ts", () => {
	describe("known type", () => {
		it("SHOULD return the name read on IGDB", () => {
			expect(getGameTypeName(REFERENCE, 0)).toBe("Main Game");
		});
	});

	describe("unknown type", () => {
		it.each([
			{ reason: "the id is not in the reference", gameType: 42 },
			{ reason: "the game has no type", gameType: undefined },
		])("SHOULD return a placeholder name WHEN $reason", ({ gameType }) => {
			expect(getGameTypeName(REFERENCE, gameType)).toBe("unknown type");
		});
	});
});
