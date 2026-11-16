import { describe, expect, it } from "vitest";

import { topFolderOf } from "./topFolderOf.ts";

const ROOT = "/data/medias/movies/";

describe("topFolderOf.ts", () => {
	describe("in a folder", () => {
		it("SHOULD give the folder of the movie", () => {
			expect(
				topFolderOf("/data/medias/movies/Ça (2017)/sub/ca.mkv", ROOT),
			).toBe("/data/medias/movies/Ça (2017)");
		});
	});

	describe("outside", () => {
		it("SHOULD give nothing for a file outside the root or right in it", () => {
			expect(topFolderOf("/data/torrents/ca.mkv", ROOT)).toBeNull();
			expect(topFolderOf("/data/medias/movies/ca.mkv", ROOT)).toBeNull();
		});
	});
});
