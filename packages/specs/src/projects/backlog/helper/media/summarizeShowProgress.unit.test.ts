import { describe, expect, it } from "vitest";

import type { ShowEpisodeState } from "./showEpisodeState.type.ts";
import { summarizeShowProgress } from "./summarizeShowProgress.ts";

const TODAY = "2026-11-16";

function episode(overrides: Partial<ShowEpisodeState>): ShowEpisodeState {
	return {
		seasonNumber: 1,
		airDate: "2026-01-01",
		runtimeMinutes: 50,
		isWatched: false,
		...overrides,
	};
}

describe("summarizeShowProgress.ts", () => {
	describe("progress", () => {
		it("SHOULD count the watched episodes among the aired ones of the main seasons", () => {
			expect(
				summarizeShowProgress(
					[
						episode({ isWatched: true }),
						episode({ seasonNumber: 2 }),
						episode({ seasonNumber: 0, isWatched: true }),
						episode({ airDate: "2026-12-01", runtimeMinutes: null }),
						episode({ airDate: null, runtimeMinutes: null }),
					],
					TODAY,
				),
			).toStrictEqual({
				watchedEpisodeCount: 1,
				airedEpisodeCount: 2,
				runtimeMinutes: 100,
				isWatched: false,
			});
		});

		it("SHOULD be watched WHEN every aired episode is, whatever the episodes still to come", () => {
			const progress = summarizeShowProgress(
				[episode({ isWatched: true }), episode({ airDate: "2027-01-01" })],
				TODAY,
			);

			expect(progress.isWatched).toBe(true);
		});
	});

	describe("nothing aired", () => {
		it("SHOULD not be watched and have no runtime WHEN no main episode is known", () => {
			expect(
				summarizeShowProgress([episode({ seasonNumber: 0 })], TODAY),
			).toStrictEqual({
				watchedEpisodeCount: 0,
				airedEpisodeCount: 0,
				runtimeMinutes: null,
				isWatched: false,
			});
		});
	});
});
