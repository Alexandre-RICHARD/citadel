import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";
import { describe, expect, it } from "vitest";

import { buildEndingTypeCustomization } from "./buildEndingTypeCustomization";

describe("buildEndingTypeCustomization.ts", () => {
	describe("customization", () => {
		it("SHOULD change the ending type and keep the image, the series and its number", () => {
			expect(
				buildEndingTypeCustomization(
					{
						imageId: "co1",
						series: { id: 7 },
						proposedSeries: { id: 7 },
						seriesNumber: 3,
					},
					EndingTypeEnum.SANDBOX,
				),
			).toStrictEqual({
				imageId: "co1",
				endingType: EndingTypeEnum.SANDBOX,
				series: { kind: SeriesChoiceKindEnum.PROPOSED },
				seriesNumber: 3,
			});
		});

		it("SHOULD keep another series than the proposed one", () => {
			expect(
				buildEndingTypeCustomization(
					{
						imageId: null,
						series: { id: 9 },
						proposedSeries: { id: 7 },
						seriesNumber: null,
					},
					EndingTypeEnum.RUNS,
				).series,
			).toStrictEqual({ kind: SeriesChoiceKindEnum.OTHER, seriesId: 9 });
		});
	});
});
