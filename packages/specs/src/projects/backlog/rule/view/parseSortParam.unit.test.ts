import { describe, expect, it } from "vitest";

import { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";
import { formatSortParam } from "./formatSortParam.ts";
import { parseSortParam } from "./parseSortParam.ts";

describe("parseSortParam.ts", () => {
	describe("readable values", () => {
		it("SHOULD read the criteria in their priority order", () => {
			const text = "releaseDate:desc,name:asc";
			const sort = parseSortParam(text);
			expect(sort).toStrictEqual([
				{
					column: BacklogColumnEnum.RELEASE_DATE,
					direction: SortDirectionEnum.DESC,
				},
				{ column: BacklogColumnEnum.NAME, direction: SortDirectionEnum.ASC },
			]);
			expect(formatSortParam(sort ?? [])).toBe(text);
		});

		it("SHOULD give no criterion WHEN the text is empty", () => {
			expect(parseSortParam("")).toStrictEqual([]);
		});
	});

	describe("unreadable values", () => {
		it.each([
			{ reason: "an unknown column", text: "price:asc" },
			{ reason: "a column that does not sort", text: "thumbnail:asc" },
			{ reason: "an unknown direction", text: "name:up" },
			{ reason: "without direction", text: "name" },
			{ reason: "a repeated column", text: "name:asc,name:desc" },
			{ reason: "an empty criterion", text: "name:asc," },
		])("SHOULD refuse the sort WHEN it has $reason", ({ text }) => {
			expect(parseSortParam(text)).toBeNull();
		});
	});
});
