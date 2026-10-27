import { REDUCED_MOTION_QUERY } from "../../browser/dom/reducedMotionQuery.ts";
import { useMediaQuery } from "./useMediaQuery.tsx";

// Suit le réglage : le composant se rafraîchit quand l'utilisateur le change
export function usePrefersReducedMotion(): boolean {
	return useMediaQuery(REDUCED_MOTION_QUERY);
}
