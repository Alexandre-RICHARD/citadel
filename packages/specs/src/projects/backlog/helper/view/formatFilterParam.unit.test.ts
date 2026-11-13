import { describe, expect, it } from "vitest";

import { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import type { ColumnFilter } from "./columnFilter.type.ts";
import { formatFilterParam } from "./formatFilterParam.ts";

describe("formatFilterParam.ts", () => {
	describe("filter kinds", () => {
		it.each<{ reason: string; filter: ColumnFilter; expected: string }>([
			{
				reason: "a text that contains",
				filter: {
					column: BacklogColumnEnum.NAME,
					kind: ColumnFilterKindEnum.TEXT,
					text: "zelda",
					isExact: false,
				},
				expected: "zelda",
			},
			{
				reason: "an exact text",
				filter: {
					column: BacklogColumnEnum.SERIES,
					kind: ColumnFilterKindEnum.TEXT,
					text: "The Witcher",
					isExact: true,
				},
				expected: "=The Witcher",
			},
			{
				reason: "a value",
				filter: {
					column: BacklogColumnEnum.PLATFORM,
					kind: ColumnFilterKindEnum.VALUE,
					values: ["PS2"],
				},
				expected: "PS2",
			},
			{
				reason: "several values",
				filter: {
					column: BacklogColumnEnum.STATUS,
					kind: ColumnFilterKindEnum.VALUE,
					values: ["finished", "platinum"],
				},
				expected: "finished|platinum",
			},
			{
				reason: "a checked box",
				filter: {
					column: BacklogColumnEnum.OWNED,
					kind: ColumnFilterKindEnum.BOOLEAN,
					value: true,
				},
				expected: "yes",
			},
			{
				reason: "an unchecked box",
				filter: {
					column: BacklogColumnEnum.UP_NEXT,
					kind: ColumnFilterKindEnum.BOOLEAN,
					value: false,
				},
				expected: "no",
			},
			{
				reason: "a number range",
				filter: {
					column: BacklogColumnEnum.RATING,
					kind: ColumnFilterKindEnum.NUMBER_RANGE,
					min: 10,
					max: 18,
				},
				expected: "10..18",
			},
			{
				reason: "a range open at the top",
				filter: {
					column: BacklogColumnEnum.RATING,
					kind: ColumnFilterKindEnum.NUMBER_RANGE,
					min: 10,
					max: null,
				},
				expected: "10..",
			},
			{
				reason: "a date range open at the bottom",
				filter: {
					column: BacklogColumnEnum.RELEASE_DATE,
					kind: ColumnFilterKindEnum.DATE_RANGE,
					from: null,
					to: "2013-09-17",
				},
				expected: "..2013-09-17",
			},
		])(
			"SHOULD write $expected WHEN the filter is $reason",
			({ filter, expected }) => {
				expect(formatFilterParam(filter)).toBe(expected);
			},
		);
	});
});
