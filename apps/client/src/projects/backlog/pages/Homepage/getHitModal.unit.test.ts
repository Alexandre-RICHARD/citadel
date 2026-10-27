import { describe, expect, it } from "vitest";

import type { GameHitFm } from "../../api/model/gameHitFm.type";
import { getHitModal } from "./getHitModal";

const HIT: GameHitFm = {
	id: 1942,
	name: "The Witcher 3",
	frenchName: null,
	matchedName: null,
	releaseYear: 2015,
	coverImageId: null,
	platformNames: [],
	storedGameId: null,
	isInBacklog: false,
};

describe("getHitModal.ts", () => {
	describe("game found on IGDB", () => {
		it("SHOULD open the add modal WHEN the game is not stored yet", () => {
			expect(getHitModal(HIT)).toStrictEqual({
				kind: "addGame",
				igdbId: 1942,
				queuedIgdbIds: [],
			});
		});
	});

	describe("stored game", () => {
		it("SHOULD open the backlog modal with the found version selected", () => {
			expect(getHitModal({ ...HIT, storedGameId: 12 })).toStrictEqual({
				kind: "addUserVersion",
				gameId: 12,
				versionId: 1942,
				imageIds: null,
				queuedIgdbIds: [],
			});
		});
	});
});
