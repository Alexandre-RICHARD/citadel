import { describe, expect, it } from "vitest";

import { formatWaitDelay } from "./formatWaitDelay";

describe("formatWaitDelay.ts", () => {
	describe("format", () => {
		it("SHOULD give the seconds alone WHEN less than a minute remains", () => {
			expect(formatWaitDelay(45_000)).toBe("45 s");
		});

		it("SHOULD give minutes and padded seconds WHEN a minute or more remains", () => {
			expect(formatWaitDelay(725_000)).toBe("12 min 05 s");
		});

		it("SHOULD round up to the next second WHEN the delay is not round", () => {
			expect(formatWaitDelay(59_001)).toBe("1 min 00 s");
		});

		it("SHOULD give zero WHEN the delay is past", () => {
			expect(formatWaitDelay(-3000)).toBe("0 s");
		});
	});
});
