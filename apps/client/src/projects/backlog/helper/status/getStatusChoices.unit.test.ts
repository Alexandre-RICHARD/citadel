import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { describe, expect, it } from "vitest";

import { getStatusChoices } from "./getStatusChoices";

describe("getStatusChoices.ts", () => {
	describe("with an ending type", () => {
		it.each(Object.values(EndingTypeEnum))(
			"SHOULD offer every status in the order of the scale, disabling none, WHEN the ending type is %s",
			(endingType) => {
				const choices = getStatusChoices(endingType, null);

				expect(choices.map(({ status }) => status)).toStrictEqual(
					Object.values(StatusEnum),
				);
				expect(choices.some(({ isDisabled }) => isDisabled)).toBe(false);
			},
		);
	});

	describe("without an ending type", () => {
		it("SHOULD list the finished statuses, disabled", () => {
			const disabled = getStatusChoices(null, null)
				.filter(({ isDisabled }) => isDisabled)
				.map(({ status }) => status);

			expect(disabled).toStrictEqual([
				StatusEnum.WATCHED,
				StatusEnum.FINISHED,
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
				StatusEnum.ABANDONED,
				StatusEnum.STARTED,
				StatusEnum.WELL_UNDERWAY,
			]);
		});

		it("SHOULD keep the current status choosable", () => {
			expect(
				getStatusChoices(null, StatusEnum.FINISHED).find(
					({ status }) => status === StatusEnum.FINISHED,
				)?.isDisabled,
			).toBe(false);
		});
	});
});
