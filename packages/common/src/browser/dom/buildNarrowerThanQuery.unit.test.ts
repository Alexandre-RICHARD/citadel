import { describe, expect, it } from "vitest";

import { buildNarrowerThanQuery } from "./buildNarrowerThanQuery.ts";

describe("buildNarrowerThanQuery.ts", () => {
	describe("query", () => {
		it("SHOULD stop just below the given width", () => {
			expect(buildNarrowerThanQuery(768)).toBe("(max-width: 767.98px)");
		});
	});
});
