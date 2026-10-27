import { describe, expect, it } from "vitest";

import { SeriesChoiceKindEnum } from "../enum/seriesChoiceKind.enum.ts";
import { seriesChoiceSchema } from "./seriesChoiceSchema.ts";

describe("seriesChoiceSchema.ts", () => {
	describe("accepted choices", () => {
		it.each([
			{
				reason: "the proposed series",
				value: { kind: SeriesChoiceKindEnum.PROPOSED },
			},
			{
				reason: "another series",
				value: { kind: SeriesChoiceKindEnum.OTHER, seriesId: 4 },
			},
			{
				reason: "a new series",
				value: { kind: SeriesChoiceKindEnum.NEW, name: "Souls" },
			},
			{ reason: "no series", value: { kind: SeriesChoiceKindEnum.NONE } },
		])("SHOULD accept the choice WHEN it is $reason", ({ value }) => {
			expect(seriesChoiceSchema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected choices", () => {
		it.each([
			{ reason: "the kind is unknown", value: { kind: "favorite" } },
			{
				reason: "another series has no id",
				value: { kind: SeriesChoiceKindEnum.OTHER },
			},
			{
				reason: "a new series has an empty name",
				value: { kind: SeriesChoiceKindEnum.NEW, name: "  " },
			},
		])("SHOULD refuse the choice WHEN $reason", ({ value }) => {
			expect(seriesChoiceSchema.safeParse(value).success).toBe(false);
		});
	});
});
