import { describe, expect, it } from "vitest";

import { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import { formatFilterParam } from "./formatFilterParam.ts";
import { parseFilterParam } from "./parseFilterParam.ts";

describe("parseFilterParam.ts", () => {
	describe("readable values", () => {
		it.each([
			{
				reason: "a text that contains",
				column: BacklogColumnEnum.NAME,
				text: "zelda",
				expected: {
					column: BacklogColumnEnum.NAME,
					kind: ColumnFilterKindEnum.TEXT,
					text: "zelda",
					isExact: false,
				},
			},
			{
				reason: "an exact text",
				column: BacklogColumnEnum.SERIES,
				text: "=The Witcher",
				expected: {
					column: BacklogColumnEnum.SERIES,
					kind: ColumnFilterKindEnum.TEXT,
					text: "The Witcher",
					isExact: true,
				},
			},
			{
				reason: "a list value",
				column: BacklogColumnEnum.STATUS,
				text: "finished",
				expected: {
					column: BacklogColumnEnum.STATUS,
					kind: ColumnFilterKindEnum.VALUE,
					value: "finished",
				},
			},
			{
				reason: "a no",
				column: BacklogColumnEnum.OWNED,
				text: "non",
				expected: {
					column: BacklogColumnEnum.OWNED,
					kind: ColumnFilterKindEnum.BOOLEAN,
					value: false,
				},
			},
			{
				reason: "a number range",
				column: BacklogColumnEnum.RATING,
				text: "10..18",
				expected: {
					column: BacklogColumnEnum.RATING,
					kind: ColumnFilterKindEnum.NUMBER_RANGE,
					min: 10,
					max: 18,
				},
			},
			{
				reason: "a date range without end",
				column: BacklogColumnEnum.FINISH_DATE,
				text: "2020-01-01..",
				expected: {
					column: BacklogColumnEnum.FINISH_DATE,
					kind: ColumnFilterKindEnum.DATE_RANGE,
					from: "2020-01-01",
					to: null,
				},
			},
		])(
			"SHOULD read the filter WHEN it is $reason",
			({ column, text, expected }) => {
				const filter = parseFilterParam(column, text);
				expect(filter).toStrictEqual(expected);
				expect(filter === null ? null : formatFilterParam(filter)).toBe(text);
			},
		);
	});

	describe("unreadable values", () => {
		it.each([
			{ reason: "an empty text", column: BacklogColumnEnum.NAME, text: "" },
			{
				reason: "a yes in English",
				column: BacklogColumnEnum.UP_NEXT,
				text: "yes",
			},
			{
				reason: "a range without bounds",
				column: BacklogColumnEnum.RATING,
				text: "..",
			},
			{
				reason: "a number without separator",
				column: BacklogColumnEnum.RATING,
				text: "12",
			},
			{
				reason: "a bound that is not a number",
				column: BacklogColumnEnum.RATING,
				text: "a..3",
			},
			{
				reason: "a day that does not exist",
				column: BacklogColumnEnum.RELEASE_DATE,
				text: "2020-02-31..",
			},
			{
				reason: "a column without filter",
				column: BacklogColumnEnum.THUMBNAIL,
				text: "x",
			},
		])("SHOULD give no filter WHEN it is $reason", ({ column, text }) => {
			expect(parseFilterParam(column, text)).toBeNull();
		});
	});
});
