import { describe, expect, expectTypeOf, it } from "vitest";

import { getIsNotNullOrUndefined } from "./getIsNotNullOrUndefined.ts";

describe("getIsNotNullOrUndefined.ts", () => {
	describe("missing values", () => {
		it.each([null, undefined])(
			"SHOULD return false WHEN the value is %o",
			(value) => {
				expect(getIsNotNullOrUndefined(value)).toBe(false);
			},
		);
	});

	describe("present values", () => {
		it.each([0, "", false, Number.NaN, [], {}])(
			"SHOULD return true WHEN the value is the falsy or empty %o",
			(value) => {
				expect(getIsNotNullOrUndefined(value)).toBe(true);
			},
		);

		it("SHOULD narrow the type WHEN used as a filter", () => {
			const names = ["Fez", null, "Hades", undefined].filter(
				getIsNotNullOrUndefined,
			);

			expect(names).toStrictEqual(["Fez", "Hades"]);
			expectTypeOf(names).toEqualTypeOf<string[]>();
		});
	});
});
