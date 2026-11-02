import { describe, expect, it } from "vitest";

import { linearGradient } from "./linearGradient.ts";

describe("linearGradient.ts", () => {
	describe("stops", () => {
		it("SHOULD spread the colours evenly from 0 to 100 %", () => {
			expect(linearGradient(90, ["#000", "#888", "#fff"])).toBe(
				"linear-gradient(90deg,#000 0%,#888 50%,#fff 100%)",
			);
		});

		it("SHOULD put the only colour at 0 % WHEN there is a single one", () => {
			expect(linearGradient(135, ["#000"])).toBe(
				"linear-gradient(135deg,#000 0%)",
			);
		});
	});
});
