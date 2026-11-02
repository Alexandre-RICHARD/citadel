import { describe, expect, it } from "vitest";

import { maskIpAddress } from "./maskIpAddress.ts";

const FULL = { ipv4PrefixLength: 32, ipv6PrefixLength: 128 };
const TRUNCATED = { ipv4PrefixLength: 24, ipv6PrefixLength: 48 };

describe("maskIpAddress.ts", () => {
	describe("IPv4", () => {
		it("SHOULD keep the address as is WHEN the prefix is 32 bits", () => {
			expect(maskIpAddress("203.0.113.42", FULL)).toBe("203.0.113.42");
		});

		it("SHOULD zero the last byte and add the prefix WHEN the prefix is 24 bits", () => {
			expect(maskIpAddress("203.0.113.42", TRUNCATED)).toBe("203.0.113.0/24");
		});

		it("SHOULD cut inside a byte WHEN the prefix is not a multiple of 8", () => {
			expect(
				maskIpAddress("203.0.113.255", { ...FULL, ipv4PrefixLength: 28 }),
			).toBe("203.0.113.240/28");
		});
	});

	describe("IPv6", () => {
		it("SHOULD keep the network part WHEN the prefix is 64 bits", () => {
			expect(
				maskIpAddress("2001:db8:1234:5678:9abc:def0:1234:5678", {
					...FULL,
					ipv6PrefixLength: 64,
				}),
			).toBe("2001:db8:1234:5678::/64");
		});

		it("SHOULD give the same network WHEN two addresses share their /48", () => {
			expect(maskIpAddress("2001:db8:aa::1", TRUNCATED)).toBe(
				maskIpAddress("2001:db8:aa:ffff::abcd", TRUNCATED),
			);
			expect(maskIpAddress("2001:db8:aa::1", TRUNCATED)).toBe(
				"2001:db8:aa::/48",
			);
		});

		it("SHOULD write the shortest form WHEN the prefix keeps everything", () => {
			expect(
				maskIpAddress("2001:0DB8:0000:0000:0000:0000:0000:0001", FULL),
			).toBe("2001:db8::1");
		});

		it.each([
			{ ip: "::1", expected: "::1", reason: "the loopback" },
			{ ip: "::", expected: "::", reason: "the unspecified address" },
			{ ip: "fe80::1%eth0", expected: "fe80::1", reason: "a zone index" },
			{
				ip: "64:ff9b::192.0.2.1",
				expected: "64:ff9b::c000:201",
				reason: "an embedded IPv4",
			},
			{
				ip: "2001:db8:0:1:0:0:1:1",
				expected: "2001:db8:0:1::1:1",
				reason: "a single zero group before a longer run",
			},
		])("SHOULD read $reason WHEN the address uses it", ({ ip, expected }) => {
			expect(maskIpAddress(ip, FULL)).toBe(expected);
		});
	});

	describe("not an IP", () => {
		it.each([
			{ ip: "unknown", reason: "a placeholder" },
			{ ip: "256.0.0.1", reason: "an IPv4 byte over 255" },
			{ ip: "2001:db8::1::2", reason: "two double colons" },
			{ ip: "2001:db8:1:2:3:4:5:6:7", reason: "nine groups" },
			{ ip: "2001:db8::g", reason: "a non-hexadecimal group" },
		])("SHOULD give the value back WHEN it is $reason", ({ ip }) => {
			expect(maskIpAddress(ip, TRUNCATED)).toBe(ip);
		});
	});
});
