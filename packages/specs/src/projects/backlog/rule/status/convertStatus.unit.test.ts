import { describe, expect, it } from "vitest";

import { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";
import { convertStatus } from "./convertStatus.ts";

describe("convertStatus.ts", () => {
	describe("incompatible statuses", () => {
		it.each([
			{
				reason: "a finished story game becomes a sandbox",
				status: StatusEnum.FINISHED,
				endingType: EndingTypeEnum.SANDBOX,
				expected: StatusEnum.DEEMED_FINISHED,
			},
			{
				reason: "a deemed finished sandbox becomes a story game",
				status: StatusEnum.DEEMED_FINISHED,
				endingType: EndingTypeEnum.STORY,
				expected: StatusEnum.FINISHED,
			},
			{
				reason: "a watched story game becomes multiplayer",
				status: StatusEnum.WATCHED,
				endingType: EndingTypeEnum.MULTIPLAYER,
				expected: StatusEnum.NOT_STARTED,
			},
		])(
			"SHOULD replace the status WHEN $reason",
			({ status, endingType, expected }) => {
				expect(convertStatus(status, endingType)).toBe(expected);
			},
		);
	});

	describe("compatible statuses", () => {
		it("SHOULD keep the status WHEN the new ending type offers it", () => {
			expect(
				convertStatus(StatusEnum.PLATINUM, EndingTypeEnum.MULTIPLAYER),
			).toBe(StatusEnum.PLATINUM);
		});
	});
});
