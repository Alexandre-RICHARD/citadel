import { describe, expect, it } from "vitest";

import { getTmdbImageUrl } from "./getTmdbImageUrl";
import { TmdbImageSizeEnum } from "./tmdbImageSize.enum";

describe("getTmdbImageUrl.ts", () => {
	describe("sizes", () => {
		it("SHOULD put the size before the image path", () => {
			expect(getTmdbImageUrl("/abc.jpg", TmdbImageSizeEnum.THUMB)).toBe(
				"https://image.tmdb.org/t/p/w92/abc.jpg",
			);
		});
	});
});
