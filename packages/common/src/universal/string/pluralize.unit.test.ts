import { describe, expect, it } from "vitest";

import { pluralize } from "./pluralize.ts";

describe("pluralize.ts", () => {
	describe("singular", () => {
		it.each([0, 1])(
			"SHOULD keep the word singular WHEN the count is %i",
			(count) => {
				expect(pluralize(count, "mort")).toBe(`${count} mort`);
			},
		);
	});

	describe("plural", () => {
		it("SHOULD add an s WHEN the count is above 1", () => {
			expect(pluralize(3, "mort")).toBe("3 morts");
		});

		it("SHOULD add an s WHEN the count is below -1", () => {
			expect(pluralize(-2, "point")).toBe("-2 points");
		});
	});
});
