import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import { describe, expect, it } from "vitest";

import { toggleSort } from "./toggleSort";

const BY_NAME = {
	column: BacklogColumnEnum.NAME,
	direction: SortDirectionEnum.ASC,
};

describe("toggleSort.ts", () => {
	describe("click cycle", () => {
		it("SHOULD add the column in ascending order, after the others, WHEN it is not sorted", () => {
			expect(toggleSort([BY_NAME], BacklogColumnEnum.RATING)).toStrictEqual([
				BY_NAME,
				{ column: BacklogColumnEnum.RATING, direction: SortDirectionEnum.ASC },
			]);
		});

		it("SHOULD switch to descending order, in place, WHEN it is ascending", () => {
			expect(
				toggleSort(
					[
						BY_NAME,
						{
							column: BacklogColumnEnum.RATING,
							direction: SortDirectionEnum.ASC,
						},
					],
					BacklogColumnEnum.NAME,
				),
			).toStrictEqual([
				{ column: BacklogColumnEnum.NAME, direction: SortDirectionEnum.DESC },
				{ column: BacklogColumnEnum.RATING, direction: SortDirectionEnum.ASC },
			]);
		});

		it("SHOULD remove the column WHEN it is descending", () => {
			expect(
				toggleSort(
					[
						{
							column: BacklogColumnEnum.NAME,
							direction: SortDirectionEnum.DESC,
						},
					],
					BacklogColumnEnum.NAME,
				),
			).toStrictEqual([]);
		});
	});
});
