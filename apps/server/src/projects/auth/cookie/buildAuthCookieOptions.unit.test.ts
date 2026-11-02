import { describe, expect, it } from "vitest";

import { buildAuthCookieOptions } from "./buildAuthCookieOptions.ts";

describe("buildAuthCookieOptions.ts", () => {
	describe("attributes", () => {
		it("SHOULD be HttpOnly, Secure, SameSite=Lax on the whole site WHEN Secure is on", () => {
			expect(buildAuthCookieOptions(true, null)).toStrictEqual({
				httpOnly: true,
				secure: true,
				sameSite: "lax",
				path: "/",
			});
		});

		it("SHOULD drop Secure only WHEN Secure is off", () => {
			expect(buildAuthCookieOptions(false, null)).toStrictEqual({
				httpOnly: true,
				secure: false,
				sameSite: "lax",
				path: "/",
			});
		});
	});

	describe("duration", () => {
		it("SHOULD give the duration WHEN one is set", () => {
			expect(buildAuthCookieOptions(true, 60_000).maxAge).toBe(60_000);
		});

		it("SHOULD give no duration WHEN the cookie lives with the browser", () => {
			expect(buildAuthCookieOptions(true, null)).not.toHaveProperty("maxAge");
		});

		it("SHOULD never give a negative duration WHEN the end is already past", () => {
			expect(buildAuthCookieOptions(true, -5).maxAge).toBe(0);
		});
	});
});
