import { describe, expect, it } from "vitest";

import { getLanguageLabel } from "./getLanguageLabel";

describe("getLanguageLabel.ts", () => {
	describe("known codes", () => {
		it.each([
			{ code: "en", expected: "Anglais" },
			{ code: "fr", expected: "Français" },
			{ code: "ja", expected: "Japonais" },
		])(
			"SHOULD give the French name WHEN the code is $code",
			({ code, expected }) => {
				expect(getLanguageLabel(code)).toBe(expected);
			},
		);
	});

	describe("unknown codes", () => {
		it("SHOULD keep the code WHEN it is not a language", () => {
			expect(getLanguageLabel("xx")).toBe("xx");
		});
	});
});
