import { flushSync } from "react-dom";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Applique un changement d'affichage (pliage d'un panneau) avec une transition animée
 * (View Transitions, réglée dans styles/main.scss). Changement immédiat si le navigateur ne
 * la connaît pas ou si l'utilisateur préfère réduire les animations.
 */
export function withViewTransition(update: () => void): void {
	// Absente des navigateurs anciens, malgré ce que disent les types du DOM
	if (
		!document.startViewTransition ||
		matchMedia(REDUCED_MOTION_QUERY).matches
	) {
		update();
		return;
	}
	// Le navigateur capture l'avant, puis l'après : React doit avoir fini de dessiner entre les deux
	document.startViewTransition(() => flushSync(update));
}
