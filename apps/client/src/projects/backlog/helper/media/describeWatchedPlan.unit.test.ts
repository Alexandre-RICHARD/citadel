import { describe, expect, it } from "vitest";

import { describeWatchedPlan } from "./describeWatchedPlan";

describe("describeWatchedPlan.ts", () => {
	describe("cascade", () => {
		it("SHOULD name the whole show WHEN the show is checked", () => {
			expect(
				describeWatchedPlan(
					{ kind: "cascade", change: { episodeIds: [1, 2], isWatched: true } },
					"la série",
				),
			).toStrictEqual({
				question:
					"Les 2 épisodes diffusés pas encore vus de toute la série passent à vu.",
				confirmLabel: "Cocher les 2 épisodes",
			});
		});

		it("SHOULD name the season WHEN it is unchecked", () => {
			expect(
				describeWatchedPlan(
					{ kind: "cascade", change: { episodeIds: [1, 2], isWatched: false } },
					"Saison 2",
				),
			).toStrictEqual({
				question: "Les 2 épisodes vus de « Saison 2 » repassent à pas vu.",
				confirmLabel: "Décocher les 2 épisodes",
			});
		});
	});

	describe("extend", () => {
		it("SHOULD count the previous episodes WHEN an episode is checked", () => {
			expect(
				describeWatchedPlan(
					{
						kind: "extend",
						change: { episodeIds: [3], isWatched: true },
						extended: { episodeIds: [1, 2, 3], isWatched: true },
					},
					"l’épisode 3",
				),
			).toStrictEqual({
				question:
					"2 épisodes précédents ne sont pas encore vus. Les cocher aussi ?",
				confirmLabel: "Cocher aussi les 2 précédents",
			});
		});

		it("SHOULD speak of the following episode WHEN only one is watched after it", () => {
			expect(
				describeWatchedPlan(
					{
						kind: "extend",
						change: { episodeIds: [1], isWatched: false },
						extended: { episodeIds: [1, 2], isWatched: false },
					},
					"l’épisode 1",
				),
			).toStrictEqual({
				question: "L’épisode suivant est vu. Le décocher aussi ?",
				confirmLabel: "Décocher aussi le suivant",
			});
		});
	});
});
