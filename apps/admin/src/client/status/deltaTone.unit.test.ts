import { describe, expect, it } from "vitest";

import { deltaTone } from "./deltaTone";

describe("deltaTone.ts", () => {
	describe("direction", () => {
		it("SHOULD be good WHEN the number moves the right way", () => {
			expect(deltaTone(10, 8, "up")).toBe("ok");
			expect(deltaTone(5, 8, "down")).toBe("ok");
		});

		it("SHOULD be bad WHEN it moves the wrong way", () => {
			expect(deltaTone(10, 8, "down")).toBe("danger");
		});
	});

	describe("neutral", () => {
		it("SHOULD be neutral without a direction or a change", () => {
			expect(deltaTone(10, 8, "none")).toBe("idle");
			expect(deltaTone(8, 8, "up")).toBe("idle");
			expect(deltaTone(8, null, "up")).toBe("idle");
		});
	});
});
