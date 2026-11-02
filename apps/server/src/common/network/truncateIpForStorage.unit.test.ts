import { describe, expect, it } from "vitest";

import { truncateIpForStorage } from "./truncateIpForStorage.ts";

describe("truncateIpForStorage.ts", () => {
	describe("truncation", () => {
		it("SHOULD keep the /24 WHEN the IP is an IPv4", () => {
			expect(truncateIpForStorage("203.0.113.42")).toBe("203.0.113.0/24");
		});

		it("SHOULD keep the /24 WHEN the IPv4 arrives written as IPv6", () => {
			expect(truncateIpForStorage("::ffff:203.0.113.42")).toBe(
				"203.0.113.0/24",
			);
		});

		it("SHOULD keep the /48 WHEN the IP is an IPv6", () => {
			expect(truncateIpForStorage("2001:db8:aa:bb:cc:dd:ee:ff")).toBe(
				"2001:db8:aa::/48",
			);
		});

		it("SHOULD fit the ip column WHEN the /48 is the longest possible", () => {
			expect(
				truncateIpForStorage("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff").length,
			).toBeLessThanOrEqual(45);
		});
	});
});
