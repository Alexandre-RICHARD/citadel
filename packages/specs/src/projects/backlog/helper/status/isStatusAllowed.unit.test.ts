import { describe, expect, it } from "vitest";

import { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";
import { isStatusAllowed } from "./isStatusAllowed.ts";

describe("isStatusAllowed.ts", () => {
	describe("with an ending type", () => {
		it.each(
			Object.values(EndingTypeEnum).flatMap((endingType) =>
				Object.values(StatusEnum).map((status) => ({ endingType, status })),
			),
		)(
			"SHOULD allow $status WHEN the ending is $endingType",
			({ status, endingType }) => {
				expect(isStatusAllowed(status, endingType)).toBe(true);
			},
		);
	});

	describe("no ending type", () => {
		it.each(Object.values(StatusEnum).filter(isFinishedStatus))(
			"SHOULD refuse the finished status %s",
			(status) => {
				expect(isStatusAllowed(status, null)).toBe(false);
			},
		);

		it.each([
			StatusEnum.NOT_STARTED,
			StatusEnum.ABANDONED,
			StatusEnum.STARTED,
			StatusEnum.WELL_UNDERWAY,
		])("SHOULD allow the status %s", (status) => {
			expect(isStatusAllowed(status, null)).toBe(true);
		});
	});
});
