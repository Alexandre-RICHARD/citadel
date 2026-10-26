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

		it("SHOULD show abandoned WHEN every played version is abandoned", () => {
			expect(getGameStatus([StatusEnum.ABANDONED, StatusEnum.ABANDONED])).toBe(
				StatusEnum.ABANDONED,
			);
		});

		it("SHOULD ignore the not started versions WHEN another one has a status", () => {
			expect(getGameStatus([StatusEnum.NOT_STARTED, StatusEnum.STARTED])).toBe(
				StatusEnum.STARTED,
			);
		});
	});

	describe("mixed situations", () => {
		it("SHOULD show the highest finished status WHEN one version is finished, even with an abandoned one", () => {
			expect(
				getGameStatus([
					StatusEnum.ABANDONED,
					StatusEnum.FINISHED,
					StatusEnum.PLATINUM,
					StatusEnum.WELL_UNDERWAY,
				]),
			).toBe(StatusEnum.PLATINUM);
		});

		it("SHOULD show the highest status WHEN no version is abandoned", () => {
			expect(
				getGameStatus([StatusEnum.WATCHED, StatusEnum.WELL_UNDERWAY]),
			).toBe(StatusEnum.WELL_UNDERWAY);
		});

		it("SHOULD show nothing WHEN abandoned is mixed with a status in progress", () => {
			expect(getGameStatus([StatusEnum.ABANDONED, StatusEnum.STARTED])).toBe(
				null,
			);
		});
	});
});
