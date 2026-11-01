import { describe, expect, it } from "vitest";

import { stripAnsi } from "./stripAnsi";

describe("stripAnsi.ts", () => {
	describe("colors", () => {
		it("SHOULD remove bold and color codes WHEN the log comes from citadel", () => {
			expect(
				stripAnsi(
					"\u001b[1m== 1. Contrôle\u001b[0m\n\u001b[31mErreur : x\u001b[0m",
				),
			).toBe("== 1. Contrôle\nErreur : x");
		});

		it("SHOULD keep the text unchanged WHEN there is no code", () => {
			expect(stripAnsi("  ✓ dump")).toBe("  ✓ dump");
		});
	});
});
