import { describe, expect, it } from "vitest";

import { isEqualInConstantTime } from "./isEqualInConstantTime.ts";

describe("isEqualInConstantTime.ts", () => {
	describe("comparison", () => {
		it("SHOULD answer true WHEN both buffers hold the same bytes", () => {
			expect(
				isEqualInConstantTime(Buffer.from("abcd"), Buffer.from("abcd")),
			).toBe(true);
		});

		it("SHOULD answer false WHEN one byte differs", () => {
			expect(
				isEqualInConstantTime(Buffer.from("abcd"), Buffer.from("abce")),
			).toBe(false);
		});

		it("SHOULD answer false without throwing WHEN the lengths differ", () => {
			expect(
				isEqualInConstantTime(Buffer.from("abcd"), Buffer.from("abc")),
			).toBe(false);
		});
	});
});
