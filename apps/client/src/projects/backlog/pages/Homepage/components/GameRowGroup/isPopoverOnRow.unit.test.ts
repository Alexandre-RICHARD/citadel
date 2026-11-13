import { describe, expect, it } from "vitest";

import { fromUserGameDtoToBacklogRowFm } from "../../../../api/model/fromUserGameDtoToBacklogRowFm";
import { buildUserGameDto } from "../../../../api/testUtils/buildUserGameDto";
import { isPopoverOnRow } from "./isPopoverOnRow";

// Le jeu 7 a sa version jouée d'id 7
const row = fromUserGameDtoToBacklogRowFm(buildUserGameDto(7));

describe("isPopoverOnRow.ts", () => {
	describe("no popover", () => {
		it("SHOULD be false WHEN nothing is open", () => {
			expect(isPopoverOnRow(null, row)).toBe(false);
		});
	});

	describe("actions menu", () => {
		it("SHOULD be true WHEN the menu is the one of this game", () => {
			expect(
				isPopoverOnRow(
					{
						kind: "actionsMenu",
						gameId: 7,
						userVersionId: null,
						pointer: null,
					},
					row,
				),
			).toBe(true);
		});

		it("SHOULD be false WHEN the menu is the one of another game", () => {
			expect(
				isPopoverOnRow(
					{
						kind: "actionsMenu",
						gameId: 8,
						userVersionId: null,
						pointer: null,
					},
					row,
				),
			).toBe(false);
		});
	});

	describe("DLC panel", () => {
		it("SHOULD be true WHEN the panel is the one of a played version of this game", () => {
			expect(isPopoverOnRow({ kind: "dlc", userVersionId: 7 }, row)).toBe(true);
		});

		it("SHOULD be false WHEN the panel is the one of another game's version", () => {
			expect(isPopoverOnRow({ kind: "dlc", userVersionId: 8 }, row)).toBe(
				false,
			);
		});
	});
});
