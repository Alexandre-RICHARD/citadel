import { describe, expect, it } from "vitest";

import { parseMemInfo } from "./parseMemInfo.ts";

describe("parseMemInfo.ts", () => {
	describe("memory", () => {
		it("SHOULD give total and available memory in bytes WHEN reading /proc/meminfo", () => {
			expect(
				parseMemInfo(
					"MemTotal:       16000 kB\nMemFree:          1000 kB\nMemAvailable:     8000 kB\n",
				),
			).toEqual({ totalBytes: 16000 * 1024, availableBytes: 8000 * 1024 });
		});
	});
});
