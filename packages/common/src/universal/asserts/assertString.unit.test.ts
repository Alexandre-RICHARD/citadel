import { describe, expect, it } from "vitest";

import { assertString } from "./assertString.ts";

describe("assertString.ts", () => {
	describe("accepted values", () => {
		it.each(["", "Celeste"])(
			"SHOULD not throw WHEN the value is %o",
			(value) => {
				expect(() => assertString(value)).not.toThrow();
			},
		);
	});

	describe("rejected values", () => {
		it.each([1, null, undefined, ["a"]])(
			"SHOULD throw WHEN the value is %o",
			(value) => {
				expect(() => assertString(value, "ctx")).toThrow(
					"ctx → value is not a string",
				);
			},
		);

		it("SHOULD name the assertion in the message WHEN no context is given", () => {
			expect(() => assertString(Symbol("x"))).toThrow(
				"assertString → value is not a string",
			);
		});
	});
});
