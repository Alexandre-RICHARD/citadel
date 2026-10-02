import { describe, expect, it } from "vitest";

import { getIsPrimitive } from "./getIsPrimitive.ts";

describe("getIsPrimitive.ts", () => {
	describe("primitives", () => {
		it.each([null, undefined, 0, "", "Celeste", true, Symbol("boss"), 10n])(
			"SHOULD return true WHEN the value is %o",
			(value) => {
				expect(getIsPrimitive(value)).toBe(true);
			},
		);
	});

	describe("non-primitives", () => {
		it.each([{}, [], new Date(0), () => 1, new Map()])(
			"SHOULD return false WHEN the value is %o",
			(value) => {
				expect(getIsPrimitive(value)).toBe(false);
			},
		);
	});
});
