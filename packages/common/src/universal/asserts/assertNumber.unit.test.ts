import { describe, expect, it } from "vitest";

import { assertNumber } from "./assertNumber.ts";

describe("assertNumber.ts", () => {
	describe("accepted values", () => {
		it.each([0, -1.5, Number.POSITIVE_INFINITY])(
			"SHOULD not throw WHEN the value is %o",
			(value) => {
				expect(() => assertNumber(value)).not.toThrow();
			},
		);
	});

	describe("rejected values", () => {
		it.each(["1", Number.NaN, null, undefined])(
			"SHOULD throw WHEN the value is %o",
			(value) => {
				expect(() => assertNumber(value, "ctx")).toThrow(
					"ctx → value is not a number",
				);
			},
		);

		it("SHOULD name the assertion in the message WHEN no context is given", () => {
			expect(() => assertNumber(Symbol("x"))).toThrow(
				"assertNumber → value is not a number",
			);
		});
	});
});
