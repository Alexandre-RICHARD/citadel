import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LanguageEnum } from "../../universal/language/language.enum.ts";
import { useTranslation } from "./useTranslation.tsx";

const translations = {
	[LanguageEnum.FRENCH]: { title: "Compteur de morts" },
	[LanguageEnum.ENGLISH]: { title: "Death counter" },
};

describe("useTranslation.tsx", () => {
	describe("current language", () => {
		it("SHOULD return the French translations", () => {
			const { result } = renderHook(() => useTranslation(translations));

			expect(result.current).toBe(translations[LanguageEnum.FRENCH]);
		});

		it("SHOULD return the same object WHEN the component renders again with the same translations", () => {
			const { result, rerender } = renderHook(() =>
				useTranslation(translations),
			);
			const firstResult = result.current;

			rerender();

			expect(result.current).toBe(firstResult);
		});
	});
});
