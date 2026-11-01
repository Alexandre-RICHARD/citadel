import { describe, expect, it } from "vitest";

import { resolveClientIp } from "./resolveClientIp.ts";

describe("resolveClientIp.ts", () => {
	describe("header from Caddy", () => {
		it("SHOULD return the header WHEN Caddy sent it", () => {
			expect(resolveClientIp("203.0.113.7", "172.18.0.5")).toBe("203.0.113.7");
		});

		it("SHOULD keep an IPv6 WHEN the visitor uses one", () => {
			expect(resolveClientIp("2001:db8::1", "172.18.0.5")).toBe("2001:db8::1");
		});
	});

	describe("without header", () => {
		it.each([
			{ reason: "absent", header: undefined },
			{ reason: "blank", header: "  " },
		])(
			"SHOULD return the connection address WHEN the header is $reason",
			({ header }) => {
				expect(resolveClientIp(header, "127.0.0.1")).toBe("127.0.0.1");
			},
		);

		it("SHOULD drop the IPv6 prefix WHEN the address is an IPv4 seen over IPv6", () => {
			expect(resolveClientIp(undefined, "::ffff:127.0.0.1")).toBe("127.0.0.1");
		});

		it("SHOULD return unknown WHEN the connection has no address", () => {
			expect(resolveClientIp(undefined, undefined)).toBe("unknown");
		});
	});
});
