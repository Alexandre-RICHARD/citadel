import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { describe, expect, it } from "vitest";

import { gameTable } from "./gameTable";
import { isDurationColumn } from "./isDurationColumn";
import { mediaTable } from "./mediaTable";

describe("isDurationColumn.ts", () => {
	describe("games", () => {
		it.each([
			BacklogColumnEnum.TRACKED_PLAY_TIME,
			BacklogColumnEnum.ESTIMATED_PLAY_TIME,
			BacklogColumnEnum.TOTAL_PLAY_TIME,
		])("SHOULD return true WHEN the column is %s", (column) => {
			expect(isDurationColumn(gameTable, column)).toBe(true);
		});

		it.each([BacklogColumnEnum.RATING, BacklogColumnEnum.FINISH_COUNT])(
			"SHOULD return false WHEN the column is %s",
			(column) => {
				expect(isDurationColumn(gameTable, column)).toBe(false);
			},
		);
	});

	describe("films and shows", () => {
		it("SHOULD return true WHEN the column is the runtime", () => {
			expect(isDurationColumn(mediaTable, MediaColumnEnum.RUNTIME)).toBe(true);
		});
	});
});
