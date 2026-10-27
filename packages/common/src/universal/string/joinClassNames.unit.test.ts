import { describe, expect, it } from "vitest";

import { joinClassNames } from "./joinClassNames.ts";

describe("joinClassNames.ts", () => {
	describe("class names", () => {
		it("SHOULD join the class names with spaces", () => {
			expect(joinClassNames("cell", "sticky")).toBe("cell sticky");
		});

		it("SHOULD skip the empty values", () => {
			expect(joinClassNames("cell", false, null, undefined, "", "edge")).toBe(
				"cell edge",
			);
		});

		it("SHOULD return an empty string WHEN every value is empty", () => {
			expect(joinClassNames(false, undefined)).toBe("");
		});
	});
});
