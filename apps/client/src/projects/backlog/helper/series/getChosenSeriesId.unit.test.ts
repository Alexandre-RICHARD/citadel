import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";
import { describe, expect, it } from "vitest";

import { getChosenSeriesId } from "./getChosenSeriesId";

const PROPOSED = { id: 1, name: "Final Fantasy" };
const ALL_SERIES = [PROPOSED, { id: 2, name: "Pokémon" }];

describe("getChosenSeriesId.ts", () => {
	describe("existing series", () => {
		it("SHOULD return the proposed series WHEN it is chosen", () => {
			expect(
				getChosenSeriesId(
					{ kind: SeriesChoiceKindEnum.PROPOSED },
					PROPOSED,
					ALL_SERIES,
				),
			).toBe(1);
		});

		it("SHOULD return the chosen series WHEN it is another one", () => {
			expect(
				getChosenSeriesId(
					{ kind: SeriesChoiceKindEnum.OTHER, seriesId: 2 },
					PROPOSED,
					ALL_SERIES,
				),
			).toBe(2);
		});

		it("SHOULD find the series with the same name, without accents or case, WHEN a new name is typed", () => {
			expect(
				getChosenSeriesId(
					{ kind: SeriesChoiceKindEnum.NEW, name: "pokemon" },
					PROPOSED,
					ALL_SERIES,
				),
			).toBe(2);
		});
	});

	describe("no existing series", () => {
		it("SHOULD return undefined WHEN the new series is still to create", () => {
			expect(
				getChosenSeriesId(
					{ kind: SeriesChoiceKindEnum.NEW, name: "Souls" },
					PROPOSED,
					ALL_SERIES,
				),
			).toBeUndefined();
		});

		it.each([
			{
				reason: "no series is chosen",
				choice: { kind: SeriesChoiceKindEnum.NONE } as const,
				proposed: PROPOSED,
			},
			{
				reason: "the proposed series is chosen but there is none",
				choice: { kind: SeriesChoiceKindEnum.PROPOSED } as const,
				proposed: null,
			},
		])("SHOULD return null WHEN $reason", ({ choice, proposed }) => {
			expect(getChosenSeriesId(choice, proposed, ALL_SERIES)).toBeNull();
		});
	});
});
