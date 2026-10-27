import { useCallback, useSyncExternalStore } from "react";

import { ColorSchemeEnum } from "./colorScheme.enum";
import { readColorScheme } from "./readColorScheme";
import { subscribeToColorScheme } from "./subscribeToColorScheme";
import { writeColorScheme } from "./writeColorScheme";

// Thème clair ou sombre, propre à chaque clé de stockage (un projet). Tous les composants qui lisent la même clé
// restent d'accord : le bouton du header et le Layout qui applique le thème, par exemple
export function useColorScheme(storageKey: string) {
	const colorScheme = useSyncExternalStore(subscribeToColorScheme, () =>
		readColorScheme(storageKey),
	);

	const toggleColorScheme = useCallback(() => {
		writeColorScheme(
			storageKey,
			colorScheme === ColorSchemeEnum.Dark
				? ColorSchemeEnum.Light
				: ColorSchemeEnum.Dark,
		);
	}, [storageKey, colorScheme]);

	return { colorScheme, toggleColorScheme };
}
