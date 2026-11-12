import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { describe, expect, it } from "vitest";

import { countConvertedStatuses } from "./countConvertedStatuses";

describe("countConvertedStatuses.ts", () => {
	describe("statuses", () => {
		it("SHOULD count only the statuses the new ending type converts", () => {
			expect(
				countConvertedStatuses(
					[StatusEnum.FINISHED, StatusEnum.STARTED, StatusEnum.WATCHED],
					EndingTypeEnum.SANDBOX,
				),
			).toBe(2);
		});

		it("SHOULD count nothing WHEN every status is still allowed", () => {
			expect(
				countConvertedStatuses(
					[StatusEnum.NOT_STARTED, StatusEnum.STARTED],
					EndingTypeEnum.MULTIPLAYER,
				),
			).toBe(0);
		});
	});
});
