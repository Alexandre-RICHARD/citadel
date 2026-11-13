import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { getGameStatus } from "./getGameStatus.ts";

describe("getGameStatus.ts", () => {
	describe("single situations", () => {
		it("SHOULD show not started WHEN every played version is not started", () => {
			expect(
				getGameStatus([StatusEnum.NOT_STARTED, StatusEnum.NOT_STARTED]),
			).toBe(StatusEnum.NOT_STARTED);
		});

		it("SHOULD show not started WHEN there is no played version", () => {
			expect(getGameStatus([])).toBe(StatusEnum.NOT_STARTED);
		});

		it("SHOULD show abandoned WHEN every played version is abandoned", () => {
			expect(getGameStatus([StatusEnum.ABANDONED, StatusEnum.ABANDONED])).toBe(
				StatusEnum.ABANDONED,
			);
		});
	});

	describe("several versions", () => {
		it("SHOULD show the most advanced status of the list", () => {
			expect(
				getGameStatus([
					StatusEnum.ABANDONED,
					StatusEnum.FINISHED,
					StatusEnum.PLATINUM,
					StatusEnum.WELL_UNDERWAY,
				]),
			).toBe(StatusEnum.PLATINUM);
		});

		it("SHOULD show abandoned WHEN the other version is not started", () => {
			expect(
				getGameStatus([StatusEnum.NOT_STARTED, StatusEnum.ABANDONED]),
			).toBe(StatusEnum.ABANDONED);
		});

		it("SHOULD show the status in progress WHEN the other version is abandoned", () => {
			expect(getGameStatus([StatusEnum.ABANDONED, StatusEnum.STARTED])).toBe(
				StatusEnum.STARTED,
			);
		});

		it("SHOULD show watched above a status in progress", () => {
			expect(
				getGameStatus([StatusEnum.WATCHED, StatusEnum.WELL_UNDERWAY]),
			).toBe(StatusEnum.WATCHED);
		});
	});
});
