import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import { describe, expect, it } from "vitest";

import { buildViewParams } from "./buildViewParams";

describe("buildViewParams.ts", () => {
	describe("sort and filters", () => {
		it("SHOULD write the sort, then the filters in column order", () => {
			const params = buildViewParams({
				sort: [
					{ column: BacklogColumnEnum.NAME, direction: SortDirectionEnum.DESC },
				],
				filters: [
					{
						column: BacklogColumnEnum.RATING,
						kind: ColumnFilterKindEnum.NUMBER_RANGE,
						min: 10,
						max: null,
					},
					{
						column: BacklogColumnEnum.OWNED,
						kind: ColumnFilterKindEnum.BOOLEAN,
						value: true,
					},
				],
			});

			expect(Object.entries(params)).toStrictEqual([
				["sort", "name:desc"],
				["owned", "oui"],
				["rating", "10.."],
			]);
		});
	});

	describe("empty view", () => {
		it("SHOULD leave the sort out WHEN there is none", () => {
			expect(buildViewParams({ sort: [], filters: [] })).toStrictEqual({});
		});
	});
});
