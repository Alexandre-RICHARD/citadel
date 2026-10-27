import type { TransitionOverlay } from "./transitionOverlay.type";

let overlay: TransitionOverlay | null = null;
let isTransitionRunning = false;
const pageReadyListeners = new Set<() => void>();

// Relie les trois acteurs d'une transition, qui ne se connaissent pas : le composant qui dessine (monté hors du
// routeur, il survit au changement de page), la page qui lance la transition, et celle qui arrive et prévient
// qu'elle est affichée
export const projectTransitionStore = {
	register(nextOverlay: TransitionOverlay): () => void {
		overlay = nextOverlay;
		return () => {
			if (overlay === nextOverlay) overlay = null;
		};
	},

	getOverlay(): TransitionOverlay | null {
		return overlay;
	},

	// Une seule transition à la fois : un second clic pendant la première est ignoré
	tryStart(): boolean {
		if (isTransitionRunning) return false;
		isTransitionRunning = true;
		return true;
	},

	finish(): void {
		isTransitionRunning = false;
	},

	// La page qui arrive sait qu'elle se dévoile sous une transition (la homepage n'y joue pas son intro)
	isRunning(): boolean {
		return isTransitionRunning;
	},

	// Appelé par l'AppContainer de chaque projet, une fois sa page affichée
	notifyPageReady(): void {
		pageReadyListeners.forEach((listener) => listener());
	},

	// Attend la page qui arrive ; au-delà de timeoutMs, on n'attend plus : l'écran ne reste jamais couvert.
	// Le second appel de settle (page prête, puis délai écoulé) ne change rien
	waitForPageReady(timeoutMs: number): Promise<void> {
		return new Promise((resolve) => {
			function settle() {
				pageReadyListeners.delete(settle);
				resolve();
			}
			pageReadyListeners.add(settle);
			setTimeout(settle, timeoutMs);
		});
	},
};
