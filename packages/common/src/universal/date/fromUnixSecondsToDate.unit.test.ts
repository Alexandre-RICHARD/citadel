import { describe, expect, it } from "vitest";

import { fromUnixSecondsToDate } from "./fromUnixSecondsToDate.ts";

describe("fromUnixSecondsToDate.ts", () => {
	describe("timestamp", () => {
		it("SHOULD read the timestamp as seconds since the epoch", () => {
			expect(fromUnixSecondsToDate(1316649600).toISOString()).toBe(
				"2011-09-22T00:00:00.000Z",
			);
		});
	});
});
