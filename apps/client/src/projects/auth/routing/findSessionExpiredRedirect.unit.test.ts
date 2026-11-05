import { describe, expect, it } from "vitest";

import { findSessionExpiredRedirect } from "./findSessionExpiredRedirect";

describe("findSessionExpiredRedirect.ts", () => {
	describe("another page", () => {
		it("SHOULD lead to the login, back to the page afterwards", () => {
			expect(findSessionExpiredRedirect("/game-death-counter?game=3")).toBe(
				"/auth/login?redirect=%2Fgame-death-counter%3Fgame%3D3",
			);
		});
	});

	describe("the login page", () => {
		it.each(["/auth/login", "/auth/login?redirect=%2Fbacklog"])(
			"SHOULD stay WHEN already on %s",
			(currentPath) => {
				expect(findSessionExpiredRedirect(currentPath)).toBeNull();
			},
		);
	});
});
