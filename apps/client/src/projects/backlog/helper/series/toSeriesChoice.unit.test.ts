import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";
import { describe, expect, it } from "vitest";

import { toSeriesChoice } from "./toSeriesChoice";

describe("toSeriesChoice.ts", () => {
	describe("series of the game", () => {
		it("SHOULD be the proposed series WHEN the game is in it", () => {
			expect(toSeriesChoice(4, 4)).toStrictEqual({
				kind: SeriesChoiceKindEnum.PROPOSED,
			});
		});

		it("SHOULD be the proposed series WHEN neither exists", () => {
			expect(toSeriesChoice(null, null)).toStrictEqual({
				kind: SeriesChoiceKindEnum.PROPOSED,
			});
		});

		it("SHOULD be another series WHEN the game is in a series not proposed", () => {
			expect(toSeriesChoice(4, 7)).toStrictEqual({
				kind: SeriesChoiceKindEnum.OTHER,
				seriesId: 7,
			});
		});

		it("SHOULD be no series WHEN the game left the proposed one", () => {
			expect(toSeriesChoice(4, null)).toStrictEqual({
				kind: SeriesChoiceKindEnum.NONE,
			});
		});
	});
});
