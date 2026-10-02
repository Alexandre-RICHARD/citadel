import { describe, expect, it } from "vitest";

import { assert } from "./assert.ts";

describe("assert.ts", () => {
	describe("truthy condition", () => {
		it.each([true, 1, "text", {}, []])(
			"SHOULD not throw WHEN the condition is %o",
			(condition) => {
				expect(() => assert(condition)).not.toThrow();
			},
		);
	});

	describe("falsy condition", () => {
		it.each([false, 0, "", null, undefined, Number.NaN])(
			"SHOULD throw WHEN the condition is %o",
			(condition) => {
				expect(() => assert(condition)).toThrow("Assertion failed");
			},
		);

		it("SHOULD throw the given message WHEN one is provided", () => {
			expect(() => assert(false, "Boss should exist")).toThrow(
				"Boss should exist",
			);
		});
	});
});
