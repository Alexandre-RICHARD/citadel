import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import { describe, expect, it } from "vitest";

import { readViewFromUrl } from "./readViewFromUrl";

describe("readViewFromUrl.ts", () => {
	describe("readable params", () => {
		it("SHOULD read the sort and each filter of the URL", () => {
			expect(
				readViewFromUrl("?sort=name:desc&owned=oui&series==Zelda"),
			).toStrictEqual({
				sort: [
					{ column: BacklogColumnEnum.NAME, direction: SortDirectionEnum.DESC },
				],
				filters: [
					{
						column: BacklogColumnEnum.SERIES,
						kind: ColumnFilterKindEnum.TEXT,
						text: "Zelda",
						isExact: true,
					},
					{
						column: BacklogColumnEnum.OWNED,
						kind: ColumnFilterKindEnum.BOOLEAN,
						value: true,
					},
				],
				filterMode: FilterModeEnum.AND,
			});
		});

		it("SHOULD read the or combination of the filters", () => {
			expect(readViewFromUrl("?filterMode=or&owned=oui").filterMode).toBe(
				FilterModeEnum.OR,
			);
		});
	});

	describe("unreadable params", () => {
		it("SHOULD fall back to and WHEN the combination is unknown", () => {
			expect(readViewFromUrl("?filterMode=xor").filterMode).toBe(
				FilterModeEnum.AND,
			);
		});

		it("SHOULD ignore an unreadable sort or filter, from an old link or typed by hand", () => {
			expect(readViewFromUrl("?sort=nope&rating=high&unknown=1")).toStrictEqual(
				{
					sort: [],
					filters: [],
					filterMode: FilterModeEnum.AND,
				},
			);
		});

		it("SHOULD return an empty view WHEN the URL has no param", () => {
			expect(readViewFromUrl("")).toStrictEqual({
				sort: [],
				filters: [],
				filterMode: FilterModeEnum.AND,
			});
		});
	});
});
