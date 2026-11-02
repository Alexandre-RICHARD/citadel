import { describe, expect, it } from "vitest";

import { groupIpForLimits } from "./groupIpForLimits.ts";

describe("groupIpForLimits.ts", () => {
	describe("grouping", () => {
		it("SHOULD give the same key WHEN two IPv6 share their /64", () => {
			expect(groupIpForLimits("2001:db8:1:2::1")).toBe(
				groupIpForLimits("2001:db8:1:2:abcd:ef01:2345:6789"),
			);
		});

		it("SHOULD give another key WHEN two IPv6 are in different /64", () => {
			expect(groupIpForLimits("2001:db8:1:2::1")).not.toBe(
				groupIpForLimits("2001:db8:1:3::1"),
			);
		});

		it("SHOULD keep each IPv4 apart WHEN two IPv4 share their /24", () => {
			expect(groupIpForLimits("203.0.113.1")).not.toBe(
				groupIpForLimits("203.0.113.2"),
			);
		});
	});
});
