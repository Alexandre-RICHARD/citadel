import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { describe, expect, it } from "vitest";

import { isDurationColumn } from "./isDurationColumn";

describe("isDurationColumn.ts", () => {
	describe("columns", () => {
		it.each([
			BacklogColumnEnum.TRACKED_PLAY_TIME,
			BacklogColumnEnum.ESTIMATED_PLAY_TIME,
			BacklogColumnEnum.TOTAL_PLAY_TIME,
		])("SHOULD return true WHEN the column is %s", (column) => {
			expect(isDurationColumn(column)).toBe(true);
		});

		it.each([BacklogColumnEnum.RATING, BacklogColumnEnum.FINISH_COUNT])(
			"SHOULD return false WHEN the column is %s",
			(column) => {
				expect(isDurationColumn(column)).toBe(false);
			},
		);
	});
});
