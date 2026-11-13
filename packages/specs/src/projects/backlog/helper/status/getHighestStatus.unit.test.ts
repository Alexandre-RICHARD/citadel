import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { getHighestStatus } from "./getHighestStatus.ts";

describe("getHighestStatus.ts", () => {
	describe("statuses", () => {
		it("SHOULD return the status of highest rank", () => {
			expect(
				getHighestStatus([
					StatusEnum.STARTED,
					StatusEnum.PLATINUM,
					StatusEnum.FINISHED,
				]),
			).toBe(StatusEnum.PLATINUM);
		});

		it("SHOULD rank Abandoned above Not started and below Started", () => {
			expect(
				getHighestStatus([StatusEnum.NOT_STARTED, StatusEnum.ABANDONED]),
			).toBe(StatusEnum.ABANDONED);
			expect(getHighestStatus([StatusEnum.ABANDONED, StatusEnum.STARTED])).toBe(
				StatusEnum.STARTED,
			);
		});

		it("SHOULD rank Watched above Well underway and below Finished", () => {
			expect(
				getHighestStatus([StatusEnum.WELL_UNDERWAY, StatusEnum.WATCHED]),
			).toBe(StatusEnum.WATCHED);
			expect(getHighestStatus([StatusEnum.WATCHED, StatusEnum.FINISHED])).toBe(
				StatusEnum.FINISHED,
			);
		});
	});

	describe("no status", () => {
		it("SHOULD return null WHEN there is no status", () => {
			expect(getHighestStatus([])).toBeNull();
		});
	});
});
