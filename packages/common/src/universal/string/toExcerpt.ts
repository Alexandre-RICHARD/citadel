import { regexDictionary } from "../regex/regexDictionary.ts";

// Le début d'un texte, sur une seule ligne et en maxLength caractères au plus, points de suspension compris
export function toExcerpt(text: string, maxLength: number): string {
	const singleLine = text.replace(regexDictionary.whitespaceRun, " ").trim();
	if (singleLine.length <= maxLength) return singleLine;
	return `${singleLine.slice(0, maxLength - 1).trimEnd()}…`;
}
