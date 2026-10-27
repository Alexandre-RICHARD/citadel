import { REDUCED_MOTION_QUERY } from "./reducedMotionQuery.ts";

// Lu à l'instant de l'appel ; un composant qui doit suivre le réglage passe par usePrefersReducedMotion
export function getPrefersReducedMotion(): boolean {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
