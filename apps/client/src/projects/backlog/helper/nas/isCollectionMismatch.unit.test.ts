import { describe, expect, it } from "vitest";

import { isCollectionMismatch } from "./isCollectionMismatch";

describe("isCollectionMismatch.ts", () => {
	describe("same name", () => {
		it("SHOULD not warn WHEN only accents and case differ", () => {
			expect(isCollectionMismatch("Les Évadés", "les evades")).toBe(false);
		});
	});

	describe("different name", () => {
		it.each([
			{ reason: "the names differ", sagaName: "Alien", collection: "Aliens" },
			{ reason: "the media has no saga", sagaName: null, collection: "Alien" },
		])("SHOULD warn WHEN $reason", ({ sagaName, collection }) => {
			expect(isCollectionMismatch(sagaName, collection)).toBe(true);
		});
	});
});
