import { getPrefersReducedMotion } from "@citadel/common/src/browser/dom/getPrefersReducedMotion";
import { flushSync } from "react-dom";

/**
 * Applique un changement d'affichage (pliage d'un panneau) avec une transition animée
 * (View Transitions, réglée dans styles/main.scss). Changement immédiat si le navigateur ne
 * la connaît pas ou si l'utilisateur préfère réduire les animations.
 */
export function withViewTransition(update: () => void): void {
	// Absente des navigateurs anciens, malgré ce que disent les types du DOM
	if (!document.startViewTransition || getPrefersReducedMotion()) {
		update();
		return;
	}
	// Le navigateur capture l'avant, puis l'après : React doit avoir fini de dessiner entre les deux
	document.startViewTransition(() => flushSync(update));
}
