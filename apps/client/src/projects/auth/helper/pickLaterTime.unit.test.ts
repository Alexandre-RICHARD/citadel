import { describe, expect, it } from "vitest";

import { pickLaterTime } from "./pickLaterTime";

describe("pickLaterTime.ts", () => {
	describe("two times", () => {
		it.each([
			{ first: 1000, second: 2000 },
			{ first: 2000, second: 1000 },
		])(
			"SHOULD give the later one WHEN they are $first and $second",
			({ first, second }) => {
				expect(pickLaterTime(first, second)).toBe(2000);
			},
		);
	});

	describe("missing times", () => {
		it("SHOULD give the other one WHEN only one is given", () => {
			expect(pickLaterTime(null, 1000)).toBe(1000);
			expect(pickLaterTime(1000, null)).toBe(1000);
		});

		it("SHOULD give null WHEN none is given", () => {
			expect(pickLaterTime(null, null)).toBeNull();
		});
	});
});
