import { describe, expect, it } from "vitest";

import { buildCookieName } from "./buildCookieName.ts";

describe("buildCookieName.ts", () => {
	describe("prefix", () => {
		it("SHOULD add __Host- WHEN the cookie is Secure", () => {
			expect(buildCookieName("citadel_session", true)).toBe(
				"__Host-citadel_session",
			);
		});

		it("SHOULD keep the bare name WHEN the cookie is not Secure", () => {
			expect(buildCookieName("citadel_session", false)).toBe("citadel_session");
		});
	});
});
