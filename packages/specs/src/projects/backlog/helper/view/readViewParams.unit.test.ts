import { describe, expect, it } from "vitest";

import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import { FilterModeEnum } from "../../enum/filterMode.enum.ts";
import { MediaColumnEnum } from "../../enum/mediaColumn.enum.ts";
import { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";
import { mediaColumnFilterKinds } from "./mediaColumnFilterKinds.ts";
import { readViewParams } from "./readViewParams.ts";

function readParams(params: Record<string, string>) {
	return readViewParams(mediaColumnFilterKinds, (name) => params[name]);
}

describe("readViewParams.ts", () => {
	describe("readable params", () => {
		it("SHOULD read the sort, the combination and the filter of each column", () => {
			expect(
				readParams({
					sort: "releaseDate:desc",
					filterMode: "or",
					watched: "no",
					title: "alien",
				}),
			).toStrictEqual({
				sort: [
					{
						column: MediaColumnEnum.RELEASE_DATE,
						direction: SortDirectionEnum.DESC,
					},
				],
				filterMode: FilterModeEnum.OR,
				filters: [
					{
						column: MediaColumnEnum.TITLE,
						kind: ColumnFilterKindEnum.TEXT,
						text: "alien",
						isExact: false,
					},
					{
						column: MediaColumnEnum.WATCHED,
						kind: ColumnFilterKindEnum.BOOLEAN,
						value: false,
					},
				],
			});
		});
	});

	describe("unreadable params", () => {
		it("SHOULD ignore them, and combine the filters with and by default", () => {
			expect(
				readParams({
					sort: "thumbnail:asc",
					filterMode: "xor",
					watched: "maybe",
					platform: "PS4",
				}),
			).toStrictEqual({
				sort: [],
				filterMode: FilterModeEnum.AND,
				filters: [],
			});
		});
	});
});
