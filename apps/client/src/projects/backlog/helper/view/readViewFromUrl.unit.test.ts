import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
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
			});
		});
	});

	describe("unreadable params", () => {
		it("SHOULD ignore an unreadable sort or filter, from an old link or typed by hand", () => {
			expect(readViewFromUrl("?sort=nope&rating=high&unknown=1")).toStrictEqual(
				{
					sort: [],
					filters: [],
				},
			);
		});

		it("SHOULD return an empty view WHEN the URL has no param", () => {
			expect(readViewFromUrl("")).toStrictEqual({ sort: [], filters: [] });
		});
	});
});
