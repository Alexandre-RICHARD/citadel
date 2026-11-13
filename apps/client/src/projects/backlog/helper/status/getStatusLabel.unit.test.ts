import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { describe, expect, it } from "vitest";

import { getStatusLabel } from "./getStatusLabel";

describe("getStatusLabel.ts", () => {
	describe("statuses with a single label", () => {
		it.each([
			EndingTypeEnum.STORY,
			EndingTypeEnum.MULTIPLAYER,
			null,
			undefined,
		])("SHOULD keep the label WHEN the ending type is %s", (endingType) => {
			expect(getStatusLabel(StatusEnum.PLATINUM, endingType)).toBe("Platiné");
		});
	});

	describe("statuses read as estimated", () => {
		it.each([EndingTypeEnum.STORY, null])(
			"SHOULD keep Fini and Complété WHEN the ending type is %s",
			(endingType) => {
				expect(getStatusLabel(StatusEnum.FINISHED, endingType)).toBe("Fini");
				expect(getStatusLabel(StatusEnum.COMPLETED, endingType)).toBe(
					"Complété (100 %)",
				);
			},
		);

		it.each([
			EndingTypeEnum.RUNS,
			EndingTypeEnum.SANDBOX,
			EndingTypeEnum.MULTIPLAYER,
		])(
			"SHOULD read Estimé fini and Estimé complété WHEN the ending type is %s",
			(endingType) => {
				expect(getStatusLabel(StatusEnum.FINISHED, endingType)).toBe(
					"Estimé fini",
				);
				expect(getStatusLabel(StatusEnum.COMPLETED, endingType)).toBe(
					"Estimé complété (100 %)",
				);
			},
		);

		it("SHOULD join both labels WHEN there is no game to read the ending type from", () => {
			expect(getStatusLabel(StatusEnum.FINISHED, undefined)).toBe(
				"Fini / Estimé fini",
			);
		});
	});
});
