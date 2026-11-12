import { useSyncExternalStore } from "react";

import { pageTransitionsStore } from "./pageTransitionsStore";

// Le choix du profil de couper les transitions entre les pages ; le composant se rafraîchit quand il change
export function usePageTransitionsDisabled(): boolean {
	return useSyncExternalStore(
		pageTransitionsStore.subscribe,
		pageTransitionsStore.isDisabled,
	);
}
