import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { applyFirstFinishCount } from "./applyFirstFinishCount.ts";

describe("applyFirstFinishCount.ts", () => {
	describe("finished status", () => {
		it("SHOULD count a first finish WHEN the count is 0", () => {
			expect(applyFirstFinishCount(StatusEnum.FINISHED, 0)).toBe(1);
		});

		it("SHOULD count a first finish WHEN the status is watched", () => {
			expect(applyFirstFinishCount(StatusEnum.WATCHED, 0)).toBe(1);
		});

		it("SHOULD keep the count WHEN the game was already finished", () => {
			expect(applyFirstFinishCount(StatusEnum.PLATINUM, 3)).toBe(3);
		});
	});

	describe("unfinished status", () => {
		it.each([StatusEnum.STARTED, StatusEnum.ABANDONED])(
			"SHOULD keep the count WHEN the status is %s",
			(status) => {
				expect(applyFirstFinishCount(status, 0)).toBe(0);
			},
		);
	});
});
