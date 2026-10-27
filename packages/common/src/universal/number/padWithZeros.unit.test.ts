import { describe, expect, it } from "vitest";

import { padWithZeros } from "./padWithZeros.ts";

describe("padWithZeros.ts", () => {
	describe("default length", () => {
		it("SHOULD pad to 2 digits WHEN the number is shorter", () => {
			expect(padWithZeros(5)).toBe("05");
		});

		it("SHOULD keep the number as is WHEN it is already long enough", () => {
			expect(padWithZeros(123)).toBe("123");
		});
	});

	describe("given length", () => {
		it("SHOULD pad to the given length", () => {
			expect(padWithZeros(42, 4)).toBe("0042");
		});
	});
});
