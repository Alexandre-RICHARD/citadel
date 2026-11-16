import { capitalizeFirstLetter } from "@citadel/common/src/universal/string/capitalizeFirstLetter";

const languageNames = new Intl.DisplayNames(["fr"], { type: "language" });

// Nom français d'une langue d'après son code ISO 639-1 (« en » → « Anglais ») ; un code inconnu reste tel quel
export function getLanguageLabel(code: string): string {
	try {
		const name = languageNames.of(code);
		return name === undefined || name === code
			? code
			: capitalizeFirstLetter(name);
	} catch {
		return code;
	}
}
