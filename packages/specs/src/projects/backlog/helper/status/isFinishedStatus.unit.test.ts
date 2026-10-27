import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

describe("isFinishedStatus.ts", () => {
	describe("finished statuses", () => {
		it.each([
			StatusEnum.FINISHED,
			StatusEnum.DEEMED_FINISHED,
			StatusEnum.COMPLETED,
			StatusEnum.PLATINUM,
			StatusEnum.COMPLETED_AND_PLATINUM,
		])("SHOULD return true WHEN the status is %s", (status) => {
			expect(isFinishedStatus(status)).toBe(true);
		});
	});

	describe("other statuses", () => {
		it.each([
			StatusEnum.NOT_STARTED,
			StatusEnum.WATCHED,
			StatusEnum.STARTED,
			StatusEnum.WELL_UNDERWAY,
			StatusEnum.ABANDONED,
		])("SHOULD return false WHEN the status is %s", (status) => {
			expect(isFinishedStatus(status)).toBe(false);
		});
	});
});
