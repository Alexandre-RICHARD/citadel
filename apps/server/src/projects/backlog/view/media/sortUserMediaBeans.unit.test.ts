import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum.ts";
import { describe, expect, it } from "vitest";

import { buildUserMediaBean } from "../../../../testUtils/unit/backlog/buildUserMediaBean.ts";
import { sortUserMediaBeans } from "./sortUserMediaBeans.ts";

describe("sortUserMediaBeans.ts", () => {
	describe("without sort", () => {
		it("SHOULD put the most recently changed media first", () => {
			const media = [
				buildUserMediaBean({
					id: 1,
					updatedAt: new Date("2026-01-01T00:00:00Z"),
				}),
				buildUserMediaBean({
					id: 2,
					updatedAt: new Date("2026-03-01T00:00:00Z"),
				}),
			];
			expect(sortUserMediaBeans(media, []).map(({ id }) => id)).toStrictEqual([
				2, 1,
			]);
		});
	});

	describe("watched", () => {
		it("SHOULD rank a show by the share of its aired episodes watched, between unwatched and watched movies", () => {
			const media = [
				buildUserMediaBean({ id: 1, isWatched: true }),
				buildUserMediaBean({
					id: 2,
					mediaType: MediaTypeEnum.SHOW,
					watchedEpisodeCount: 12,
					airedEpisodeCount: 26,
				}),
				buildUserMediaBean({ id: 3, isWatched: false }),
			];
			expect(
				sortUserMediaBeans(media, [
					{ column: MediaColumnEnum.WATCHED, direction: SortDirectionEnum.ASC },
				]).map(({ id }) => id),
			).toStrictEqual([3, 2, 1]);
		});
	});

	describe("numbers", () => {
		it("SHOULD sort the TMDB ids as numbers and put the empty runtimes last", () => {
			const media = [
				buildUserMediaBean({ id: 1, tmdbId: 1000, runtimeMinutes: null }),
				buildUserMediaBean({ id: 2, tmdbId: 99, runtimeMinutes: 90 }),
			];
			expect(
				sortUserMediaBeans(media, [
					{ column: MediaColumnEnum.TMDB_ID, direction: SortDirectionEnum.ASC },
				]).map(({ id }) => id),
			).toStrictEqual([2, 1]);
			expect(
				sortUserMediaBeans(media, [
					{
						column: MediaColumnEnum.RUNTIME,
						direction: SortDirectionEnum.DESC,
					},
				]).map(({ id }) => id),
			).toStrictEqual([2, 1]);
		});
	});
});
