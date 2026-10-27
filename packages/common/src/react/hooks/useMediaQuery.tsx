import { useCallback, useSyncExternalStore } from "react";

// Suit une media query (« (prefers-reduced-motion: reduce) »…) : le composant se rafraîchit quand elle change
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(listener: () => void) => {
			const mediaQuery = window.matchMedia(query);
			mediaQuery.addEventListener("change", listener);
			return () => mediaQuery.removeEventListener("change", listener);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
	);
}
