import { ColorSchemeEnum } from "./colorScheme.enum";
import { getSystemColorScheme } from "./getSystemColorScheme";

function isColorScheme(value: string | null): value is ColorSchemeEnum {
	return Object.values<string | null>(ColorSchemeEnum).includes(value);
}

// Le choix enregistré, sinon la préférence du système
export function readColorScheme(storageKey: string): ColorSchemeEnum {
	try {
		const storedValue = localStorage.getItem(storageKey);
		if (isColorScheme(storedValue)) return storedValue;
	} catch {
		// Stockage inaccessible (navigation privée, réglage du navigateur) : on suit le système
	}
	return getSystemColorScheme();
}
