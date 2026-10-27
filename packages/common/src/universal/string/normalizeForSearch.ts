import { regexDictionary } from "../regex/regexDictionary.ts";
import { normalizeText } from "./normalizeText.ts";

// Comme normalizeText, la ponctuation en moins : « Foch-Maison Bleue » → « foch maison bleue », découpable en mots
export function normalizeForSearch(text: string): string {
	return normalizeText(text)
		.replace(regexDictionary.nonAlphanumericRun, " ")
		.trim();
}
