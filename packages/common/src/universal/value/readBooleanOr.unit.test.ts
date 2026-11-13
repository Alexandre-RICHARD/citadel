import { describe, expect, it } from "vitest";

import { readBooleanOr } from "./readBooleanOr.ts";

describe("readBooleanOr.ts", () => {
	describe("booleans", () => {
		it.each([true, false])("SHOULD return %s WHEN it is given", (value) => {
			expect(readBooleanOr(value, !value)).toBe(value);
		});
	});

	describe("other values", () => {
		it.each([
			{ value: undefined, reason: "undefined" },
			{ value: null, reason: "null" },
			{ value: "true", reason: "a string" },
			{ value: 1, reason: "a number" },
			{ value: {}, reason: "an object" },
		])("SHOULD return the fallback WHEN the value is $reason", ({ value }) => {
			expect(readBooleanOr(value, true)).toBe(true);
			expect(readBooleanOr(value, false)).toBe(false);
		});
	});
});
