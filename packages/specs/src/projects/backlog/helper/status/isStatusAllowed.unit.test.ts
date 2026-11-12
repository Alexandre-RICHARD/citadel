import { describe, expect, it } from "vitest";

import { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";
import { isStatusAllowed } from "./isStatusAllowed.ts";

describe("isStatusAllowed.ts", () => {
	describe("statuses tied to an ending", () => {
		it.each([
			{
				status: StatusEnum.FINISHED,
				endingType: EndingTypeEnum.STORY,
				expected: true,
			},
			{
				status: StatusEnum.FINISHED,
				endingType: EndingTypeEnum.SANDBOX,
				expected: false,
			},
			{
				status: StatusEnum.DEEMED_FINISHED,
				endingType: EndingTypeEnum.MULTIPLAYER,
				expected: true,
			},
			{
				status: StatusEnum.DEEMED_FINISHED,
				endingType: EndingTypeEnum.RUNS,
				expected: false,
			},
			{
				status: StatusEnum.WATCHED,
				endingType: EndingTypeEnum.RUNS,
				expected: true,
			},
			{
				status: StatusEnum.WATCHED,
				endingType: EndingTypeEnum.SANDBOX,
				expected: false,
			},
		])(
			"SHOULD return $expected WHEN the status is $status and the ending $endingType",
			({ status, endingType, expected }) => {
				expect(isStatusAllowed(status, endingType)).toBe(expected);
			},
		);
	});

	describe("no ending type", () => {
		it.each([
			StatusEnum.WATCHED,
			StatusEnum.FINISHED,
			StatusEnum.DEEMED_FINISHED,
			StatusEnum.COMPLETED,
			StatusEnum.PLATINUM,
			StatusEnum.COMPLETED_AND_PLATINUM,
		])("SHOULD refuse the finished status %s", (status) => {
			expect(isStatusAllowed(status, null)).toBe(false);
		});

		it.each([
			StatusEnum.NOT_STARTED,
			StatusEnum.STARTED,
			StatusEnum.WELL_UNDERWAY,
			StatusEnum.ABANDONED,
		])("SHOULD allow the status %s", (status) => {
			expect(isStatusAllowed(status, null)).toBe(true);
		});
	});

	describe("statuses for every ending", () => {
		it.each(Object.values(EndingTypeEnum))(
			"SHOULD allow Started and Completed WHEN the ending is %s",
			(endingType) => {
				expect(isStatusAllowed(StatusEnum.STARTED, endingType)).toBe(true);
				expect(isStatusAllowed(StatusEnum.COMPLETED, endingType)).toBe(true);
			},
		);
	});
});
