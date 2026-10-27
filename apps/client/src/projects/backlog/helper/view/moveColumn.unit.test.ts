import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { describe, expect, it } from "vitest";

import { moveColumn } from "./moveColumn";

const COLUMNS = [
	{ key: BacklogColumnEnum.NAME, isVisible: true },
	{ key: BacklogColumnEnum.SERIES, isVisible: true },
	{ key: BacklogColumnEnum.RATING, isVisible: false },
];

function getKeys(columns: { key: BacklogColumnEnum }[]): BacklogColumnEnum[] {
	return columns.map(({ key }) => key);
}

describe("moveColumn.ts", () => {
	describe("neighbour", () => {
		it("SHOULD swap the column with its right neighbour WHEN the offset is 1", () => {
			expect(
				getKeys(moveColumn(COLUMNS, BacklogColumnEnum.NAME, 1)),
			).toStrictEqual([
				BacklogColumnEnum.SERIES,
				BacklogColumnEnum.NAME,
				BacklogColumnEnum.RATING,
			]);
		});

		it("SHOULD swap the column with its left neighbour WHEN the offset is -1", () => {
			expect(
				getKeys(moveColumn(COLUMNS, BacklogColumnEnum.RATING, -1)),
			).toStrictEqual([
				BacklogColumnEnum.NAME,
				BacklogColumnEnum.RATING,
				BacklogColumnEnum.SERIES,
			]);
		});
	});

	describe("no neighbour", () => {
		it.each([
			{
				reason: "the column is first and moves left",
				key: BacklogColumnEnum.NAME,
				offset: -1 as const,
			},
			{
				reason: "the column is last and moves right",
				key: BacklogColumnEnum.RATING,
				offset: 1 as const,
			},
			{
				reason: "the column is not in the list",
				key: BacklogColumnEnum.COMMENT,
				offset: 1 as const,
			},
		])("SHOULD move nothing WHEN $reason", ({ key, offset }) => {
			expect(moveColumn(COLUMNS, key, offset)).toStrictEqual(COLUMNS);
		});
	});
});
