import type { TransitionPoint } from "./transitionPoint.type";

// D'où part la transition : l'élément qui a lancé la navigation (il a le focus juste après un clic ou la touche Entrée),
// sinon le centre de l'écran (précédent et suivant du navigateur, Safari qui ne donne pas le focus au clic)
export function getTransitionOrigin(
	fromActiveElement: boolean,
): TransitionPoint {
	const element = document.activeElement;
	if (fromActiveElement && element && element !== document.body) {
		const rect = element.getBoundingClientRect();
		return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	}
	return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}
