import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import { describe, expect, it } from "vitest";

import { keepVisibleView } from "./keepVisibleView";

const COLUMNS = [
	{ key: BacklogColumnEnum.NAME, isVisible: true },
	{ key: BacklogColumnEnum.RATING, isVisible: false },
];

describe("keepVisibleView.ts", () => {
	describe("hidden columns", () => {
		it("SHOULD drop the sort and the filters of the hidden or missing columns", () => {
			const view = keepVisibleView(
				{
					sort: [
						{
							column: BacklogColumnEnum.RATING,
							direction: SortDirectionEnum.DESC,
						},
						{
							column: BacklogColumnEnum.NAME,
							direction: SortDirectionEnum.ASC,
						},
					],
					filters: [
						{
							column: BacklogColumnEnum.OWNED,
							kind: ColumnFilterKindEnum.BOOLEAN,
							value: true,
						},
						{
							column: BacklogColumnEnum.NAME,
							kind: ColumnFilterKindEnum.TEXT,
							text: "zelda",
							isExact: false,
						},
					],
				},
				COLUMNS,
			);

			expect(view.sort.map(({ column }) => column)).toStrictEqual([
				BacklogColumnEnum.NAME,
			]);
			expect(view.filters.map(({ column }) => column)).toStrictEqual([
				BacklogColumnEnum.NAME,
			]);
		});
	});
});
