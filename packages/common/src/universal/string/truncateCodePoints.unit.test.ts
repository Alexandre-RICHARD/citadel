import { describe, expect, it } from "vitest";

import { truncateCodePoints } from "./truncateCodePoints.ts";

describe("truncateCodePoints.ts", () => {
	describe("short texts", () => {
		it.each([
			{ reason: "shorter than the limit", text: "Firefox" },
			{ reason: "exactly at the limit", text: "Firefox/140" },
		])("SHOULD return the text unchanged WHEN it is $reason", ({ text }) => {
			// Act
			const truncated = truncateCodePoints(text, 11);

			// Assert
			expect(truncated).toBe(text);
		});
	});

	describe("long texts", () => {
		it("SHOULD keep the first characters WHEN the text is longer than the limit", () => {
			// Act
			const truncated = truncateCodePoints("Mozilla/5.0 Firefox", 7);

			// Assert
			expect(truncated).toBe("Mozilla");
		});

		it("SHOULD count an emoji as one character and never split it WHEN it sits at the limit", () => {
			// Act
			const truncated = truncateCodePoints("ab😀cd", 3);

			// Assert
			expect(truncated).toBe("ab😀");
		});
	});
});
