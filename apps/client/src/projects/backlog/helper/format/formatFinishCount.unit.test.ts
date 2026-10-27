import { describe, expect, it } from "vitest";

import { formatFinishCount } from "./formatFinishCount";

describe("formatFinishCount.ts", () => {
	describe("counts", () => {
		it("SHOULD write only the sure count WHEN there is no probable finish", () => {
			expect(formatFinishCount(2, 0)).toBe("2");
		});

		it("SHOULD add the probable count WHEN there is one", () => {
			expect(formatFinishCount(2, 1)).toBe("2 (+1 ?)");
		});
	});
});
