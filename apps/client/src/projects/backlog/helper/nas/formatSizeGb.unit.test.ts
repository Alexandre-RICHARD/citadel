import { describe, expect, it } from "vitest";

import { formatSizeGb } from "./formatSizeGb";

describe("formatSizeGb.ts", () => {
	describe("sizes", () => {
		it.each([
			{ sizeBytes: 4_240_000_000, text: "4,2 Go" },
			{ sizeBytes: 1_500_000_000_000, text: "1,5 To" },
		])("SHOULD show $text", ({ sizeBytes, text }) => {
			expect(formatSizeGb(sizeBytes).replace(/\u202f|\u00a0/g, " ")).toBe(text);
		});
	});
});
