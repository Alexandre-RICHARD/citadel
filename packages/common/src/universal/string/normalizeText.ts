import { regexDictionary } from "../regex/regexDictionary.ts";

// Sans accents ni majuscules, pour comparer deux textes comme un humain : « pokemon » trouve « Pokémon »
export function normalizeText(text: string): string {
	return text
		.normalize("NFD")
		.replace(regexDictionary.diacritic, "")
		.toLowerCase();
}
