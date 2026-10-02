import { beforeEach, describe, expect, it } from "vitest";

import { clearAllCookies } from "../../testUtils/clearAllCookies.ts";
import { checkCookie } from "./checkCookie.ts";

describe("checkCookie.ts", () => {
	beforeEach(() => {
		clearAllCookies();
	});

	describe("existence", () => {
		it("SHOULD return true WHEN the cookie exists", () => {
			document.cookie = "lang=fr; path=/";

			expect(checkCookie("lang")).toBe(true);
		});

		it("SHOULD return true WHEN the cookie exists with an empty value", () => {
			document.cookie = "empty=; path=/";

			expect(checkCookie("empty")).toBe(true);
		});

		it("SHOULD return false WHEN the cookie does not exist", () => {
			document.cookie = "language=fr; path=/";

			expect(checkCookie("lang")).toBe(false);
		});
	});
});
