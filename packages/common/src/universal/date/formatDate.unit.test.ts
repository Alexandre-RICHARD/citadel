import { describe, expect, it } from "vitest";

import { LanguageEnum } from "../language/language.enum.ts";
import { formatDate } from "./formatDate.ts";

// Construites en heure locale : le résultat ne dépend pas du fuseau de la machine
const date = new Date(2011, 8, 22, 9, 5);

describe("formatDate.ts", () => {
	describe("valid date", () => {
		it("SHOULD format day, month, year, hours and minutes WHEN the language is French", () => {
			expect(formatDate(date, LanguageEnum.FRENCH)).toBe("22/09/2011 09:05");
		});

		it("SHOULD use the American order and a 12-hour clock WHEN the language is English", () => {
			// ICU peut séparer « AM » par une espace fine insécable selon sa version
			expect(
				formatDate(date, LanguageEnum.ENGLISH).replaceAll("\u202f", " "),
			).toBe("09/22/2011, 09:05 AM");
		});
	});

	describe("invalid date", () => {
		it("SHOULD return an explicit text WHEN the date is invalid", () => {
			expect(formatDate(new Date("not a date"), LanguageEnum.FRENCH)).toBe(
				"Date au format invalide",
			);
		});
	});
});
