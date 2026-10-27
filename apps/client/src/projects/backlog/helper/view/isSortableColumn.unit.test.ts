import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { describe, expect, it } from "vitest";

import { isSortableColumn } from "./isSortableColumn";

describe("isSortableColumn.ts", () => {
	describe("columns", () => {
		it.each([BacklogColumnEnum.THUMBNAIL, BacklogColumnEnum.ACTIONS])(
			"SHOULD return false WHEN the column is %s",
			(column) => {
				expect(isSortableColumn(column)).toBe(false);
			},
		);

		it.each([
			BacklogColumnEnum.NAME,
			BacklogColumnEnum.RELEASE_DATE,
			BacklogColumnEnum.OWNED,
		])("SHOULD return true WHEN the column is %s", (column) => {
			expect(isSortableColumn(column)).toBe(true);
		});
	});
});
