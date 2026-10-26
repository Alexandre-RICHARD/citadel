import { describe, expect, it, vi } from "vitest";

import { createFakeIgdb } from "../../../testUtils/unit/backlog/createFakeIgdb.ts";
import { fetchIgdbGameData } from "./fetchIgdbGameData.ts";
import { igdbClient } from "./igdbClient.ts";

// env.ts arrête le process sans .env : le client IGDB n'en a pas besoin ici, ses requêtes sont simulées
vi.mock("../../../configuration/env.ts", () => ({ env: {} }));

// Final Fantasy VII : un original, un portage d'un portage, une édition, un remake rattaché par erreur, et des contenus
const ORIGINAL = {
	id: 393025,
	name: "Final Fantasy VII",
	game_type: 0,
	expanded_games: [427],
	dlcs: [5001, 5002],
	url: "u",
};
const EXPANDED = {
	id: 427,
	name: "Final Fantasy VII",
	game_type: 10,
	parent_game: 393025,
	ports: [11001],
	url: "u",
};
const PORT = {
	id: 11001,
	name: "Final Fantasy VII",
	game_type: 11,
	parent_game: 427,
	url: "u",
};
const EDITION = {
	id: 12001,
	name: "Final Fantasy VII International",
	game_type: 0,
	version_parent: 393025,
	url: "u",
};
const REMAKE_ATTACHED = {
	id: 13001,
	name: "Final Fantasy VII Remake",
	game_type: 8,
	version_parent: 393025,
	url: "u",
};
const DLC = { id: 5001, name: "Some DLC", game_type: 1 };
const UPDATE = { id: 5002, name: "Patch 1.1", game_type: 14 };

describe("fetchIgdbGameData.ts", () => {
	describe("version tree", () => {
		it("SHOULD climb from a port to the original, then gather every version and skip the wrong types", async () => {
			// Arrange
			vi.spyOn(igdbClient, "request").mockImplementation(
				createFakeIgdb([
					ORIGINAL,
					EXPANDED,
					PORT,
					EDITION,
					REMAKE_ATTACHED,
					DLC,
					UPDATE,
				]),
			);

			// Act
			const data = await fetchIgdbGameData(PORT.id);

			// Assert
			expect(data?.original.id).toBe(ORIGINAL.id);
			expect(data?.versions.map(({ id }) => id).toSorted()).toStrictEqual(
				[ORIGINAL.id, EXPANDED.id, PORT.id, EDITION.id].toSorted(),
			);
			expect(data?.skippedEntries).toStrictEqual([
				{ typeName: "Remake", entry: REMAKE_ATTACHED },
			]);
			// Les mises à jour ne sont pas des DLC
			expect(data?.dlcs).toStrictEqual([DLC]);
		});
	});

	describe("missing entries", () => {
		it("SHOULD give null WHEN the entry does not exist on IGDB", async () => {
			// Arrange
			vi.spyOn(igdbClient, "request").mockImplementation(createFakeIgdb([]));

			// Act
			const data = await fetchIgdbGameData(42);

			// Assert
			expect(data).toBeNull();
		});
	});
});
