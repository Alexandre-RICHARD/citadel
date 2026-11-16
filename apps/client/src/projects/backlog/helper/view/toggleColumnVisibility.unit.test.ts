import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { describe, expect, it } from "vitest";

import { gameTable } from "./gameTable";
import { toggleColumnVisibility } from "./toggleColumnVisibility";

const COLUMNS = [
	{ key: BacklogColumnEnum.NAME, isVisible: true },
	{ key: BacklogColumnEnum.RATING, isVisible: false },
	{ key: BacklogColumnEnum.ACTIONS, isVisible: true },
];

describe("toggleColumnVisibility.ts", () => {
	describe("regular column", () => {
		it.each([
			{ key: BacklogColumnEnum.NAME, expected: false },
			{ key: BacklogColumnEnum.RATING, expected: true },
		])("SHOULD flip the visibility of $key", ({ key, expected }) => {
			expect(
				toggleColumnVisibility(gameTable, COLUMNS, key).find(
					(column) => column.key === key,
				)?.isVisible,
			).toBe(expected);
		});
	});

	describe("actions column", () => {
		it("SHOULD keep the actions visible, without them there is no menu", () => {
			expect(
				toggleColumnVisibility(gameTable, COLUMNS, BacklogColumnEnum.ACTIONS),
			).toStrictEqual(COLUMNS);
		});
	});
});
