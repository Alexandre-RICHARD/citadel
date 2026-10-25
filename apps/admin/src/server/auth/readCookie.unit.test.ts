import { describe, expect, it } from "vitest";

import { readCookie } from "./readCookie.ts";

describe("readCookie.ts", () => {
	describe("lookup", () => {
		it("SHOULD return the value WHEN the cookie is among others", () => {
			expect(readCookie("a=1; session=abc-def; b=2", "session")).toBe(
				"abc-def",
			);
		});

		it("SHOULD return undefined WHEN the header is missing", () => {
			expect(readCookie(undefined, "session")).toBeUndefined();
		});

		it("SHOULD ignore a cookie WHEN its name only starts like the wanted one", () => {
			expect(readCookie("sessionx=1", "session")).toBeUndefined();
		});
	});
});
