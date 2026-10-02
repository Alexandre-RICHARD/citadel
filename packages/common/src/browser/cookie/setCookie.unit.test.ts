import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAllCookies } from "../../testUtils/clearAllCookies.ts";
import { setCookie } from "./setCookie.ts";

const NOW = new Date("2024-02-29T12:00:00.000Z");
const MINUTE = 60 * 1000;

describe("setCookie.ts", () => {
	beforeEach(() => {
		clearAllCookies();
		// Seule la date est simulée : jsdom l'utilise pour faire expirer les cookies
		vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("value", () => {
		it("SHOULD create a cookie readable by the page", () => {
			setCookie({ name: "theme", value: "dark", hours: 1 });

			expect(document.cookie).toBe("theme=dark");
		});

		it("SHOULD encode the characters that would break the cookie", () => {
			setCookie({ name: "note", value: "Ori & Blind; Forest", hours: 1 });

			expect(document.cookie).toBe("note=Ori%20%26%20Blind%3B%20Forest");
		});

		it("SHOULD replace the value WHEN the cookie already exists", () => {
			setCookie({ name: "lang", value: "fr", hours: 1 });
			setCookie({ name: "lang", value: "en", hours: 1 });

			expect(document.cookie).toBe("lang=en");
		});
	});

	describe("expiration", () => {
		it("SHOULD keep the cookie until the given number of hours has passed", () => {
			setCookie({ name: "theme", value: "dark", hours: 2 });

			vi.setSystemTime(NOW.getTime() + 119 * MINUTE);
			expect(document.cookie).toBe("theme=dark");

			vi.setSystemTime(NOW.getTime() + 121 * MINUTE);
			expect(document.cookie).toBe("");
		});

		it("SHOULD expire after 1 hour WHEN no duration is given", () => {
			setCookie({ name: "theme", value: "dark" });

			vi.setSystemTime(NOW.getTime() + 59 * MINUTE);
			expect(document.cookie).toBe("theme=dark");

			vi.setSystemTime(NOW.getTime() + 61 * MINUTE);
			expect(document.cookie).toBe("");
		});

		it("SHOULD create a session cookie, without expiration date, WHEN the duration is 0", () => {
			setCookie({ name: "theme", value: "dark", hours: 0 });

			vi.setSystemTime(NOW.getTime() + 365 * 24 * 60 * MINUTE);
			expect(document.cookie).toBe("theme=dark");
		});

		it("SHOULD remove the cookie WHEN the duration is negative", () => {
			setCookie({ name: "theme", value: "dark", hours: 1 });

			setCookie({ name: "theme", value: "", hours: -1 });

			expect(document.cookie).toBe("");
		});
	});
});
