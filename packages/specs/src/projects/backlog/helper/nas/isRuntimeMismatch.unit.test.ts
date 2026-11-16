import { describe, expect, it } from "vitest";

import { isRuntimeMismatch } from "./isRuntimeMismatch.ts";

describe("isRuntimeMismatch.ts", () => {
	describe("mismatch", () => {
		it.each([
			{
				reason: "the file is a longer cut",
				fileMinutes: 180,
				tmdbMinutes: 160,
			},
			{ reason: "the file is shorter", fileMinutes: 90, tmdbMinutes: 100 },
		])("SHOULD warn WHEN $reason", ({ fileMinutes, tmdbMinutes }) => {
			expect(isRuntimeMismatch(fileMinutes, tmdbMinutes)).toBe(true);
		});
	});

	describe("no mismatch", () => {
		it.each([
			{
				reason: "the gap is exactly the tolerance",
				fileMinutes: 107.5,
				tmdbMinutes: 100,
			},
			{
				reason: "the file duration is unknown",
				fileMinutes: null,
				tmdbMinutes: 100,
			},
			{ reason: "TMDB has no runtime", fileMinutes: 100, tmdbMinutes: null },
			{ reason: "TMDB gives a zero runtime", fileMinutes: 100, tmdbMinutes: 0 },
		])("SHOULD not warn WHEN $reason", ({ fileMinutes, tmdbMinutes }) => {
			expect(isRuntimeMismatch(fileMinutes, tmdbMinutes)).toBe(false);
		});
	});
});
