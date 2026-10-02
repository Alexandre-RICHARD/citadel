import { describe, expect, it } from "vitest";

import { assertBoolean } from "./assertBoolean.ts";

describe("assertBoolean.ts", () => {
	describe("accepted values", () => {
		it.each([true, false])("SHOULD not throw WHEN the value is %o", (value) => {
			expect(() => assertBoolean(value)).not.toThrow();
		});
	});

	describe("rejected values", () => {
		it.each(["true", 0, null, undefined])(
			"SHOULD throw WHEN the value is %o",
			(value) => {
				expect(() => assertBoolean(value, "ctx")).toThrow(
					"ctx → value is not a boolean",
				);
			},
		);

		it("SHOULD name the assertion in the message WHEN no context is given", () => {
			expect(() => assertBoolean(Symbol("x"))).toThrow(
				"assertBoolean → value is not a boolean",
			);
		});
	});
});
