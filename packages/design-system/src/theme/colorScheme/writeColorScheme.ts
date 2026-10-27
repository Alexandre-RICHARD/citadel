import type { ColorSchemeEnum } from "./colorScheme.enum";
import { colorSchemeChangeEvent } from "./colorSchemeChangeEvent";
import { getSystemColorScheme } from "./getSystemColorScheme";

// Le choix n'est enregistré que s'il diffère du système : revenir au thème du système efface l'entrée
export function writeColorScheme(
	storageKey: string,
	colorScheme: ColorSchemeEnum,
): void {
	try {
		if (colorScheme === getSystemColorScheme())
			localStorage.removeItem(storageKey);
		else localStorage.setItem(storageKey, colorScheme);
	} catch {
		// Stockage inaccessible : le choix ne survivra pas au rechargement, la page change quand même
	}
	window.dispatchEvent(
		new CustomEvent(colorSchemeChangeEvent, { detail: colorScheme }),
	);
}
