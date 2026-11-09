import { describe, expect, it } from "vitest";

import { StatusEnum } from "../../enum/status.enum.ts";
import { finishedStatuses } from "./finishedStatuses.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

describe("finishedStatuses.ts", () => {
	describe("list", () => {
		it("SHOULD hold exactly the statuses isFinishedStatus accepts", () => {
			expect(finishedStatuses).toStrictEqual(
				Object.values(StatusEnum).filter(isFinishedStatus),
			);
		});

		it.each([
			StatusEnum.FINISHED,
			StatusEnum.DEEMED_FINISHED,
			StatusEnum.COMPLETED,
			StatusEnum.PLATINUM,
			StatusEnum.COMPLETED_AND_PLATINUM,
		])("SHOULD contain %s", (status) => {
			expect(finishedStatuses).toContain(status);
		});

		it.each([
			StatusEnum.NOT_STARTED,
			StatusEnum.STARTED,
			StatusEnum.WELL_UNDERWAY,
			StatusEnum.ABANDONED,
		])("SHOULD not contain %s", (status) => {
			expect(finishedStatuses).not.toContain(status);
		});
	});
});
