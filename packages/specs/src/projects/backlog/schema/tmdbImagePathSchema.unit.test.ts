import { describe, expect, it } from "vitest";

import { tmdbImagePathSchema } from "./tmdbImagePathSchema.ts";

const schema = tmdbImagePathSchema("Image path");

describe("tmdbImagePathSchema.ts", () => {
	describe("accepted values", () => {
		it.each(["/kqjL17yufvn9OVLyXYpvtyrFfak.jpg", "/a_b-c.png", "/logo.svg"])(
			"SHOULD accept %s",
			(path) => {
				expect(schema.safeParse(path).success).toBe(true);
			},
		);
	});

	describe("rejected values", () => {
		it.each([
			"kqjL17yufvn9OVLyXYpvtyrFfak.jpg",
			"/../secret.jpg",
			"/image.gif",
			"https://image.tmdb.org/t/p/original/a.jpg",
			`/${"a".repeat(100)}.jpg`,
		])("SHOULD reject %s", (path) => {
			expect(schema.safeParse(path).success).toBe(false);
		});
	});
});
