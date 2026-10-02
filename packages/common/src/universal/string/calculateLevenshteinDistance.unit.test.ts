import { describe, expect, it } from "vitest";

import { calculateLevenshteinDistance } from "./calculateLevenshteinDistance.ts";

describe("calculateLevenshteinDistance.ts", () => {
	describe("known distances", () => {
		it.each([
			{ a: "kitten", b: "sitting", distance: 3 },
			{ a: "flaw", b: "lawn", distance: 2 },
			{ a: "Saturday", b: "Sunday", distance: 3 },
			{ a: "intention", b: "execution", distance: 5 },
			{ a: "Hollow Knight", b: "Hollow Knight: Silksong", distance: 10 },
			{ a: "Dark Souls", b: "Dark Souls III", distance: 4 },
			{ a: "Celeste", b: "Celestial", distance: 3 },
		])(
			"SHOULD return $distance WHEN comparing '$a' and '$b'",
			({ a, b, distance }) => {
				expect(calculateLevenshteinDistance(a, b)).toBe(distance);
			},
		);

		it("SHOULD return the same distance whatever the order of the strings", () => {
			expect(calculateLevenshteinDistance("sitting", "kitten")).toBe(3);
		});
	});

	describe("edge cases", () => {
		it("SHOULD return 0 WHEN the strings are identical", () => {
			expect(calculateLevenshteinDistance("Elden Ring", "Elden Ring")).toBe(0);
		});

		it("SHOULD return the length of the other string WHEN one string is empty", () => {
			expect(calculateLevenshteinDistance("", "Fez")).toBe(3);
			expect(calculateLevenshteinDistance("Returnal", "")).toBe(8);
		});

		it("SHOULD count a case change as a substitution", () => {
			expect(calculateLevenshteinDistance("celeste", "Celeste")).toBe(1);
		});

		it("SHOULD count every character WHEN nothing is shared", () => {
			expect(calculateLevenshteinDistance("abcdefgh", "ijklmnop")).toBe(8);
		});

		it("SHOULD count the swap of two neighbouring letters as 2 operations", () => {
			expect(calculateLevenshteinDistance("Celeste", "Cleeste")).toBe(2);
		});
	});

	// Au-delà de 32 caractères, le calcul se fait par blocs de 32 lignes
	describe("strings longer than 32 characters", () => {
		const digits = "0123456789".repeat(5);

		it("SHOULD find the edits WHEN they are at both ends of a long string", () => {
			expect(calculateLevenshteinDistance(`a${digits}b`, `c${digits}`)).toBe(2);
		});

		it("SHOULD find an edit in the middle of a block WHEN the string spans 4 blocks", () => {
			const original = `[${"x".repeat(50)}${"y".repeat(48)}]`;
			const edited = `(${"x".repeat(50)}z${"y".repeat(47)})`;

			expect(calculateLevenshteinDistance(original, edited)).toBe(3);
		});

		it("SHOULD count every character WHEN long strings share nothing", () => {
			expect(calculateLevenshteinDistance("x".repeat(70), "y".repeat(75))).toBe(
				75,
			);
		});
	});
});
