import { describe, expect, it } from "vitest";

import { normalizeText } from "./normalizeText.ts";

describe("normalizeText.ts", () => {
	describe("accents and case", () => {
		it.each([
			{ reason: "accents", text: "Pokémon", expected: "pokemon" },
			{ reason: "capitals", text: "ZELDA", expected: "zelda" },
			{ reason: "a cedilla", text: "Façade", expected: "facade" },
		])("SHOULD remove the $reason", ({ text, expected }) => {
			expect(normalizeText(text)).toBe(expected);
		});
	});

	describe("other characters", () => {
		it("SHOULD keep spaces and punctuation", () => {
			expect(normalizeText("Final Fantasy VII: Remake")).toBe(
				"final fantasy vii: remake",
			);
		});
	});
});
