import { describe, expect, it } from "vitest";

import { parseEpisodeNumbers } from "./parseEpisodeNumbers.ts";

describe("parseEpisodeNumbers.ts", () => {
	describe("numbers", () => {
		it("SHOULD read S01E02 and 1x02", () => {
			expect(parseEpisodeNumbers("Show.S01E02.1080p.mkv")).toStrictEqual({
				seasonNumber: 1,
				episodeNumber: 2,
			});
			expect(parseEpisodeNumbers("Show 3x12.mkv")).toStrictEqual({
				seasonNumber: 3,
				episodeNumber: 12,
			});
		});
	});

	describe("no numbers", () => {
		it("SHOULD give nothing", () => {
			expect(parseEpisodeNumbers("Show.Special.mkv")).toBeNull();
		});
	});
});
