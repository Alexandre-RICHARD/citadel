import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAllCookies } from "../../testUtils/clearAllCookies.ts";
import { deleteCookie } from "./deleteCookie.ts";

describe("deleteCookie.ts", () => {
	beforeEach(() => {
		clearAllCookies();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("existing cookie", () => {
		it("SHOULD remove the cookie and keep the others", () => {
			document.cookie = "theme=dark; path=/";
			document.cookie = "lang=fr; path=/";

			deleteCookie("theme");

			expect(document.cookie).toBe("lang=fr");
		});
	});

	describe("missing cookie", () => {
		it("SHOULD not write any cookie WHEN the cookie does not exist", () => {
			document.cookie = "lang=fr; path=/";
			const cookieSetter = vi.spyOn(document, "cookie", "set");

			deleteCookie("theme");

			expect(cookieSetter).not.toHaveBeenCalled();
			expect(document.cookie).toBe("lang=fr");
		});
	});
});
