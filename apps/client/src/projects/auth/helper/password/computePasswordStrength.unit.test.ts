import { describe, expect, it } from "vitest";

import { computePasswordStrength } from "./computePasswordStrength";
import { PasswordStrengthEnum } from "./passwordStrength.enum";

describe("computePasswordStrength.ts", () => {
	describe("weak passwords", () => {
		it.each([
			{ reason: "empty", password: "" },
			{ reason: "a keyboard row", password: "azertyuiop12" },
			{ reason: "a reversed keyboard row", password: "poiuytreza12" },
			{ reason: "a single character repeated", password: "aaaaaaaaaaaa" },
			{ reason: "a digit sequence", password: "123456789012" },
			{ reason: "a letter sequence", password: "abcdefghijkl" },
			{ reason: "a short word", password: "chat" },
		])("SHOULD be very weak WHEN the password is $reason", ({ password }) => {
			expect(computePasswordStrength(password)).toBe(
				PasswordStrengthEnum.VERY_WEAK,
			);
		});
	});

	describe("strong passwords", () => {
		it.each([
			{
				reason: "a long sentence",
				password: "le chat dort sur le canapé bleu",
			},
			{ reason: "varied random characters", password: "G7#qLr!2vX9&mPw" },
			{ reason: "emojis and letters", password: "🐢🌵🎲 tortue cactus dé" },
		])("SHOULD be excellent WHEN the password is $reason", ({ password }) => {
			expect(computePasswordStrength(password)).toBe(
				PasswordStrengthEnum.EXCELLENT,
			);
		});
	});

	describe("known limit", () => {
		it("SHOULD overestimate a dictionary word in disguise, as the « ? » warns", () => {
			expect(computePasswordStrength("P@ssw0rd!")).toBeGreaterThanOrEqual(
				PasswordStrengthEnum.FAIR,
			);
		});
	});

	describe("growth", () => {
		it("SHOULD never get weaker WHEN random characters are added", () => {
			// Arrange
			const strengths = ["Tq8", "Tq8#mZ", "Tq8#mZ2vL", "Tq8#mZ2vL!rW4"].map(
				computePasswordStrength,
			);

			// Assert
			expect(strengths).toStrictEqual(
				[...strengths].sort((first, second) => first - second),
			);
		});
	});
});
