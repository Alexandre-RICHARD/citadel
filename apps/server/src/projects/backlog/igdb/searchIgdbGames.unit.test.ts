import { describe, expect, it, vi } from "vitest";

import { createFakeIgdb } from "../../../testUtils/unit/backlog/createFakeIgdb.ts";
import { igdbClient } from "./igdbClient.ts";
import { searchIgdbGames } from "./searchIgdbGames.ts";

// env.ts arrête le process sans .env : le client IGDB n'en a pas besoin ici, ses requêtes sont simulées
vi.mock("../../../configuration/env.ts", () => ({ env: {} }));

const SKYRIM = { id: 72, name: "The Elder Scrolls V: Skyrim", game_type: 0 };
const SKYRIM_SPECIAL = {
	id: 19457,
	name: "The Elder Scrolls V: Skyrim Special Edition",
	game_type: 9,
	parent_game: 72,
};
const DAWNGUARD = {
	id: 2208,
	name: "The Elder Scrolls V: Skyrim - Dawnguard",
	game_type: 1,
	parent_game: 72,
};
const MASS_EFFECT_TRILOGY = {
	id: 900,
	name: "Mass Effect Trilogy",
	game_type: 3,
};
const MASS_EFFECT_2 = {
	id: 902,
	name: "Mass Effect 2",
	game_type: 0,
	bundles: [900],
	first_release_date: 1264550400,
};
const MASS_EFFECT = {
	id: 901,
	name: "Mass Effect",
	game_type: 0,
	bundles: [900],
	first_release_date: 1195516800,
};

function mockIgdb(
	entries: Record<string, unknown>[],
	results: Record<string, unknown>[],
) {
	return vi
		.spyOn(igdbClient, "request")
		.mockImplementation(createFakeIgdb(entries as never, results as never));
}

describe("searchIgdbGames.ts", () => {
	describe("base games", () => {
		it("SHOULD lead a version and a DLC to their game, which takes the place of the best ranked one", async () => {
			// Arrange
			mockIgdb([SKYRIM], [SKYRIM_SPECIAL, DAWNGUARD, SKYRIM]);

			// Act
			const hits = await searchIgdbGames("skyrim");

			// Assert
			expect(hits).toStrictEqual([{ game: SKYRIM, matchedName: null }]);
		});

		it("SHOULD name the entry that found the game WHEN the game was not found itself", async () => {
			// Arrange
			mockIgdb([SKYRIM], [DAWNGUARD]);

			// Act
			const hits = await searchIgdbGames("dawnguard");

			// Assert
			expect(hits).toStrictEqual([
				{
					game: SKYRIM,
					matchedName: "The Elder Scrolls V: Skyrim - Dawnguard",
				},
			]);
		});

		it("SHOULD give the games of a bundle in release order, after the games found directly", async () => {
			// Arrange
			mockIgdb([MASS_EFFECT, MASS_EFFECT_2], [MASS_EFFECT_TRILOGY, SKYRIM]);

			// Act
			const hits = await searchIgdbGames("mass effect");

			// Assert
			expect(hits.map(({ game }) => game.id)).toStrictEqual([72, 901, 902]);
			expect(hits[1]?.matchedName).toBe("Mass Effect Trilogy");
		});
	});

	describe("requests", () => {
		it("SHOULD exclude mods from the search and escape the quotes of the query", async () => {
			// Arrange
			const requestSpy = mockIgdb([], []);

			// Act
			await searchIgdbGames('the "best" game');

			// Assert
			const searchBody = requestSpy.mock.calls
				.map(([, body]) => body)
				.findLast((body) => body.startsWith("search"));
			expect(searchBody).toContain('search "the \\"best\\" game";');
			expect(searchBody).toContain("where game_type = (0,1,2,3,8,9,10,11);");
		});
	});
});
