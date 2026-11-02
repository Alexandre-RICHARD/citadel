import { describe, expect, it } from "vitest";

import { hasInvisibleCharacter } from "./hasInvisibleCharacter.ts";

describe("hasInvisibleCharacter.ts", () => {
	describe("visible texts", () => {
		it.each([
			{ reason: "letters and digits", text: "Alex42" },
			{ reason: "accents and spaces", text: "Élodie Durand" },
			{ reason: "an emoji", text: "Alex 🎮" },
			{ reason: "an emoji with a skin tone", text: "👋🏽" },
			{ reason: "an emoji with its variation selector", text: "Alex ❤️" },
			{ reason: "an emoji sequence with joiners", text: "👨‍👩‍👧" },
			{ reason: "a joined emoji with a skin tone", text: "🧑🏽‍💻" },
		])("SHOULD find nothing WHEN the text has $reason", ({ text }) => {
			expect(hasInvisibleCharacter(text)).toBe(false);
		});
	});

	describe("invisible characters", () => {
		it.each([
			{ reason: "a zero-width space", text: "Al​ex" },
			{ reason: "a soft hyphen", text: "Al­ex" },
			{ reason: "a right-to-left override", text: "Al‮ex" },
			{ reason: "a byte order mark", text: "﻿Alex" },
			{ reason: "a tabulation", text: "Al\tex" },
			{ reason: "a line break", text: "Al\nex" },
			{ reason: "a line separator", text: "Al ex" },
			{ reason: "a joiner between two letters", text: "Al‍ex" },
			{ reason: "a variation selector after a letter", text: "Ale️x" },
		])("SHOULD find one WHEN the text has $reason", ({ text }) => {
			expect(hasInvisibleCharacter(text)).toBe(true);
		});
	});
});
