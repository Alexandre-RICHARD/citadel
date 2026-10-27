import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { getHighestStatus } from "./getHighestStatus.ts";

describe("getHighestStatus.ts", () => {
	describe("ranked statuses", () => {
		it("SHOULD return the status of highest rank", () => {
			expect(
				getHighestStatus([
					StatusEnum.STARTED,
					StatusEnum.PLATINUM,
					StatusEnum.FINISHED,
				]),
			).toBe(StatusEnum.PLATINUM);
		});

		it("SHOULD keep the first one WHEN two statuses share the rank", () => {
			expect(
				getHighestStatus([StatusEnum.DEEMED_FINISHED, StatusEnum.FINISHED]),
			).toBe(StatusEnum.DEEMED_FINISHED);
		});

		it("SHOULD ignore Abandoned, which has no rank", () => {
			expect(getHighestStatus([StatusEnum.ABANDONED, StatusEnum.WATCHED])).toBe(
				StatusEnum.WATCHED,
			);
		});
	});

	describe("no ranked status", () => {
		it.each([
			{ reason: "every status is Abandoned", statuses: [StatusEnum.ABANDONED] },
			{ reason: "there is no status", statuses: [] },
		])("SHOULD return null WHEN $reason", ({ statuses }) => {
			expect(getHighestStatus(statuses)).toBeNull();
		});
	});
});
