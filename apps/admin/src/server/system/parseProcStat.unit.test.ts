import { describe, expect, it } from "vitest";

import { parseProcStat } from "./parseProcStat.ts";

describe("parseProcStat.ts", () => {
	describe("cpu line", () => {
		it("SHOULD count idle and iowait as unused time WHEN reading the total line", () => {
			expect(
				parseProcStat(
					"cpu  100 0 50 800 50 0 0 0 0 0\ncpu0 25 0 12 200 12 0 0 0 0 0\n",
				),
			).toEqual({ used: 150, total: 1000 });
		});

		it("SHOULD return null WHEN the content is not /proc/stat", () => {
			expect(parseProcStat("autre chose")).toBeNull();
		});
	});
});
