import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";
import { describe, expect, it } from "vitest";

import { resolveOptimisticSeries } from "./resolveOptimisticSeries";

const PROPOSED = { id: 1, name: "Team Ico" };
const ALL_SERIES = [PROPOSED, { id: 2, name: "Pokémon" }];

describe("resolveOptimisticSeries.ts", () => {
	describe("proposed series", () => {
		it("SHOULD return the series proposed by IGDB", () => {
			expect(
				resolveOptimisticSeries(
					{ kind: SeriesChoiceKindEnum.PROPOSED },
					PROPOSED,
					ALL_SERIES,
					-5,
				),
			).toStrictEqual(PROPOSED);
		});
	});

	describe("other series", () => {
		it("SHOULD return the chosen series of the database", () => {
			expect(
				resolveOptimisticSeries(
					{ kind: SeriesChoiceKindEnum.OTHER, seriesId: 2 },
					PROPOSED,
					ALL_SERIES,
					-5,
				),
			).toStrictEqual({ id: 2, name: "Pokémon" });
		});
	});

	describe("new series", () => {
		it("SHOULD return the existing series WHEN the name only differs by accents and case", () => {
			expect(
				resolveOptimisticSeries(
					{ kind: SeriesChoiceKindEnum.NEW, name: "pokemon" },
					PROPOSED,
					ALL_SERIES,
					-5,
				),
			).toStrictEqual({ id: 2, name: "Pokémon" });
		});

		it("SHOULD return a temporary series WHEN the name is new", () => {
			expect(
				resolveOptimisticSeries(
					{ kind: SeriesChoiceKindEnum.NEW, name: "Ratchet & Clank" },
					PROPOSED,
					ALL_SERIES,
					-5,
				),
			).toStrictEqual({ id: -5, name: "Ratchet & Clank" });
		});
	});

	describe("no series", () => {
		it("SHOULD return null", () => {
			expect(
				resolveOptimisticSeries(
					{ kind: SeriesChoiceKindEnum.NONE },
					PROPOSED,
					ALL_SERIES,
					-5,
				),
			).toBeNull();
		});
	});
});
