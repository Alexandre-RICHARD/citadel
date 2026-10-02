import { regexDictionary } from "../regex/regexDictionary.ts";

export function formatNumberWithSpaces(value: number): string {
	return new Intl.NumberFormat("fr-FR")
		.format(value)
		.replace(regexDictionary.narrowNoBreakSpace, " ");
}
