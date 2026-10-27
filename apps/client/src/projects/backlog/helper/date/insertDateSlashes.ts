import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary";

// Places des barres dans « jj/mm/aaaa »
const SLASH_INDEXES = [2, 5];
const DATE_DIGIT_COUNT = 8;

// La saisie ne contient que des chiffres et, au plus, les barres de « jj/mm/aaaa », la dernière déjà suivie d'un chiffre
function isSlashlessOrOwnFormat(text: string): boolean {
	return (
		regexDictionary.digitsAndSlashes.test(text) &&
		!text.endsWith("/") &&
		[...text].every(
			(character, index) => character !== "/" || SLASH_INDEXES.includes(index),
		)
	);
}

/**
 * En tapant des chiffres, les barres s'ajoutent toutes seules : « 17092013 » s'écrit « 17/09/2013 ».
 * Une saisie qui pose ses propres barres ailleurs (« 1/9/2013 ») reste telle quelle
 */
export function insertDateSlashes(text: string): string {
	if (!isSlashlessOrOwnFormat(text)) return text;
	const digits = text
		.replace(regexDictionary.slash, "")
		.slice(0, DATE_DIGIT_COUNT);
	return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
		.filter((part) => part !== "")
		.join("/");
}
