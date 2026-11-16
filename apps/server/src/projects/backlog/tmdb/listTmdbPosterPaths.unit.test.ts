import { describe, expect, it } from "vitest";

import { listTmdbPosterPaths } from "./listTmdbPosterPaths.ts";

describe("listTmdbPosterPaths.ts", () => {
	describe("order", () => {
		it("SHOULD put the default poster first, then the others without duplicate", () => {
			expect(
				listTmdbPosterPaths("/b.jpg", {
					posters: [{ file_path: "/a.jpg" }, { file_path: "/b.jpg" }],
				}),
			).toStrictEqual(["/b.jpg", "/a.jpg"]);
		});
	});

	describe("missing data", () => {
		it("SHOULD list only the other posters WHEN there is no default poster", () => {
			expect(
				listTmdbPosterPaths(null, { posters: [{ file_path: "/a.jpg" }] }),
			).toStrictEqual(["/a.jpg"]);
		});

		it("SHOULD give an empty list WHEN TMDB has no poster at all", () => {
			expect(listTmdbPosterPaths(null, { posters: null })).toStrictEqual([]);
		});
	});
});
