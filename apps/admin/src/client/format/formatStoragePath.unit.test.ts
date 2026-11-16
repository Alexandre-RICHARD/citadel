import { describe, expect, it } from "vitest";

import { formatStoragePath } from "./formatStoragePath";

describe("formatStoragePath.ts", () => {
	describe("path", () => {
		it("SHOULD drop the container root", () => {
			expect(formatStoragePath("/data/medias/movies/Ça (2017)/ca.mkv")).toBe(
				"medias/movies/Ça (2017)/ca.mkv",
			);
		});
	});
});
