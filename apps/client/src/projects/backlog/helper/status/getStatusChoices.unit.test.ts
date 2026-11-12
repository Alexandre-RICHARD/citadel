import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { describe, expect, it } from "vitest";

import { getStatusChoices } from "./getStatusChoices";

describe("getStatusChoices.ts", () => {
	describe("with an ending type", () => {
		it("SHOULD leave out the statuses the ending type does not offer", () => {
			const statuses = getStatusChoices(EndingTypeEnum.SANDBOX, null).map(
				({ status }) => status,
			);

			expect(statuses).not.toContain(StatusEnum.FINISHED);
			expect(statuses).not.toContain(StatusEnum.WATCHED);
			expect(statuses).toContain(StatusEnum.DEEMED_FINISHED);
		});

		it("SHOULD keep the current status even when the ending type does not offer it", () => {
			expect(
				getStatusChoices(EndingTypeEnum.SANDBOX, StatusEnum.FINISHED).map(
					({ status }) => status,
				),
			).toContain(StatusEnum.FINISHED);
		});

		it("SHOULD disable nothing", () => {
			expect(
				getStatusChoices(EndingTypeEnum.STORY, null).some(
					({ isDisabled }) => isDisabled,
				),
			).toBe(false);
		});
	});

	describe("without an ending type", () => {
		it("SHOULD list the finished statuses, disabled", () => {
			const disabled = getStatusChoices(null, null)
				.filter(({ isDisabled }) => isDisabled)
				.map(({ status }) => status);

			expect(disabled).toStrictEqual([
				StatusEnum.WATCHED,
				StatusEnum.FINISHED,
				StatusEnum.DEEMED_FINISHED,
				StatusEnum.COMPLETED,
				StatusEnum.PLATINUM,
				StatusEnum.COMPLETED_AND_PLATINUM,
			]);
		});

		it("SHOULD offer the statuses that are not a finish", () => {
			const enabled = getStatusChoices(null, null)
				.filter(({ isDisabled }) => !isDisabled)
				.map(({ status }) => status);

			expect(enabled).toStrictEqual([
				StatusEnum.NOT_STARTED,
				StatusEnum.STARTED,
				StatusEnum.WELL_UNDERWAY,
				StatusEnum.ABANDONED,
			]);
		});
	});
});
