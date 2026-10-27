import { describe, expect, it } from "vitest";

import { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";
import { formatSortParam } from "./formatSortParam.ts";

describe("formatSortParam.ts", () => {
	describe("criteria", () => {
		it("SHOULD write each criterion with its direction, in priority order", () => {
			expect(
				formatSortParam([
					{
						column: BacklogColumnEnum.RELEASE_DATE,
						direction: SortDirectionEnum.DESC,
					},
					{ column: BacklogColumnEnum.NAME, direction: SortDirectionEnum.ASC },
				]),
			).toBe("releaseDate:desc,name:asc");
		});

		it("SHOULD return an empty string WHEN there is no criterion", () => {
			expect(formatSortParam([])).toBe("");
		});
	});
});
