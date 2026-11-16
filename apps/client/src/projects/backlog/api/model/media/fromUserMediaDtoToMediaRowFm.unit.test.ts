import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { describe, expect, it } from "vitest";

import { buildUserMediaDto } from "../../testUtils/buildUserMediaDto";
import { fromUserMediaDtoToMediaRowFm } from "./fromUserMediaDtoToMediaRowFm";

describe("fromUserMediaDtoToMediaRowFm.ts", () => {
	describe("titles and progress", () => {
		it("SHOULD hide the original title WHEN it is the French one, and give a show its episode progress", () => {
			const row = fromUserMediaDtoToMediaRowFm(
				buildUserMediaDto(3, {
					mediaType: MediaTypeEnum.SHOW,
					tmdbId: 1396,
					watchedEpisodeCount: 12,
					airedEpisodeCount: 26,
				}),
			);
			expect(row).toMatchObject({
				userMediaId: 3,
				tmdbUrl: "https://www.themoviedb.org/tv/1396",
				originalTitle: null,
				episodeProgress: { watchedCount: 12, airedCount: 26 },
				isTemporary: false,
			});
		});

		it("SHOULD mark a row added before the server answered as temporary", () => {
			const row = fromUserMediaDtoToMediaRowFm(
				buildUserMediaDto(-1, { originalTitle: "The Matrix" }),
			);
			expect(row).toMatchObject({
				originalTitle: "The Matrix",
				episodeProgress: null,
				isTemporary: true,
			});
		});
	});
});
