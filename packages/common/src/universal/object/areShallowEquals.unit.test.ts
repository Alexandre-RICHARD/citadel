import { describe, expect, it } from "vitest";

import { areShallowEquals } from "./areShallowEquals.ts";

describe("areShallowEquals.ts", () => {
	describe("same content", () => {
		it("SHOULD be true WHEN every key holds the identical value", () => {
			const shared = { id: 1 };

			expect(areShallowEquals({ a: shared, b: 2 }, { b: 2, a: shared })).toBe(
				true,
			);
		});

		it("SHOULD be true for two empty objects", () => {
			expect(areShallowEquals({}, {})).toBe(true);
		});
	});

	describe("different content", () => {
		it("SHOULD be false WHEN a value is an equal but distinct object", () => {
			expect(areShallowEquals({ a: { id: 1 } }, { a: { id: 1 } })).toBe(false);
		});

		it("SHOULD be false WHEN one object has an extra key", () => {
			expect(areShallowEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		});

		it("SHOULD be false WHEN a key of the first object is missing from the second", () => {
			expect(areShallowEquals({ a: undefined }, { b: undefined })).toBe(false);
		});
	});
});
