import { beforeEach, describe, expect, it } from "vitest";

import { clearAllCookies } from "../../testUtils/clearAllCookies.ts";
import { getCookie } from "./getCookie.ts";

describe("getCookie.ts", () => {
	beforeEach(() => {
		clearAllCookies();
	});

	describe("existing cookie", () => {
		it("SHOULD return the value of the named cookie WHEN there are several cookies", () => {
			document.cookie = "theme=dark; path=/";
			document.cookie = "lang=fr; path=/";

			expect(getCookie("lang")).toBe("fr");
			expect(getCookie("theme")).toBe("dark");
		});

		it("SHOULD keep the equal signs that are part of the value", () => {
			document.cookie = "token=a=b==; path=/";

			expect(getCookie("token")).toBe("a=b==");
		});

		it("SHOULD return an empty string WHEN the cookie has no value", () => {
			document.cookie = "empty=; path=/";

			expect(getCookie("empty")).toBe("");
		});
	});

	describe("decoding", () => {
		it("SHOULD decode the value, even WHEN it contains an encoded semicolon", () => {
			document.cookie = "note=Ori%20%26%20Blind%3B%20Forest; path=/";
			document.cookie = "other=1; path=/";

			expect(getCookie("note")).toBe("Ori & Blind; Forest");
			expect(getCookie("other")).toBe("1");
		});

		it("SHOULD return the raw value WHEN its encoding is malformed", () => {
			document.cookie = "broken=100%; path=/";

			expect(getCookie("broken")).toBe("100%");
		});
	});

	describe("missing cookie", () => {
		it("SHOULD return undefined WHEN no cookie has this name", () => {
			document.cookie = "theme=dark; path=/";

			expect(getCookie("lang")).toBeUndefined();
		});

		it("SHOULD not match a cookie whose name only starts with the searched name", () => {
			document.cookie = "language=fr; path=/";

			expect(getCookie("lang")).toBeUndefined();
		});
	});
});
