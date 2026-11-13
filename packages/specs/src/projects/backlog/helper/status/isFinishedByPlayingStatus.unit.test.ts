import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedByPlayingStatus } from "./isFinishedByPlayingStatus.ts";

describe("isFinishedByPlayingStatus.ts", () => {
	describe("finished by playing", () => {
		it.each([
			StatusEnum.FINISHED,
			StatusEnum.COMPLETED,
			StatusEnum.PLATINUM,
			StatusEnum.COMPLETED_AND_PLATINUM,
		])("SHOULD return true WHEN the status is %s", (status) => {
			expect(isFinishedByPlayingStatus(status)).toBe(true);
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
			expect(isFinishedByPlayingStatus(status)).toBe(false);
		});
	});
});
