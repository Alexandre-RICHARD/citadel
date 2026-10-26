import { describe, expect, it } from "vitest";

import { trimToNull } from "./trimToNull.ts";

describe("trimToNull.ts", () => {
	describe("texts with content", () => {
		it("SHOULD remove the spaces around the text", () => {
			expect(trimToNull("  French title \t")).toBe("French title");
		});
	});

	describe("texts without content", () => {
		it.each([
			{ reason: "undefined", value: undefined },
			{ reason: "null", value: null },
			{ reason: "empty", value: "" },
			{ reason: "only spaces", value: "   " },
		])("SHOULD give null WHEN the text is $reason", ({ value }) => {
			expect(trimToNull(value)).toBeNull();
		});
	});
});
