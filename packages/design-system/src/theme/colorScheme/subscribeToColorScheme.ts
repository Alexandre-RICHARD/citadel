import { colorSchemeChangeEvent } from "./colorSchemeChangeEvent";
import { darkColorSchemeQuery } from "./darkColorSchemeQuery";

// Prévient d'un changement de thème : choix dans la page, dans un autre onglet, ou préférence du système.
// Se passe tel quel à useSyncExternalStore
export function subscribeToColorScheme(listener: () => void): () => void {
	const systemQuery = window.matchMedia(darkColorSchemeQuery);
	systemQuery.addEventListener("change", listener);
	window.addEventListener("storage", listener);
	window.addEventListener(colorSchemeChangeEvent, listener);

	return () => {
		systemQuery.removeEventListener("change", listener);
		window.removeEventListener("storage", listener);
		window.removeEventListener(colorSchemeChangeEvent, listener);
	};
}
