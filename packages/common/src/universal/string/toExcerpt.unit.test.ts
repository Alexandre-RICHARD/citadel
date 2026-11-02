import { describe, expect, it } from "vitest";

import { toExcerpt } from "./toExcerpt.ts";

describe("toExcerpt.ts", () => {
	describe("short text", () => {
		it("SHOULD put the text on a single line WHEN it has line breaks and repeated spaces", () => {
			expect(toExcerpt("Bonjour,\n\nComment  ça va ?", 50)).toBe(
				"Bonjour, Comment ça va ?",
			);
		});

		it("SHOULD keep the text whole WHEN it is exactly as long as the limit", () => {
			expect(toExcerpt("Bonjour", 7)).toBe("Bonjour");
		});
	});

	describe("long text", () => {
		it("SHOULD cut the text and end with an ellipsis within the limit WHEN it is too long", () => {
			expect(toExcerpt("Un message assez long", 10)).toBe("Un messag…");
		});

		it("SHOULD not leave a space before the ellipsis WHEN the cut falls after a word", () => {
			expect(toExcerpt("Un message assez long", 12)).toBe("Un message…");
		});
	});
});
