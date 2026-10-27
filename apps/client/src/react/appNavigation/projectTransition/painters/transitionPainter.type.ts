import type { TransitionFrame } from "./transitionFrame.type";

// Dessine une image de la transition, sur un canvas déjà effacé
export type TransitionPainter = {
	draw: (context: CanvasRenderingContext2D, frame: TransitionFrame) => void;
};
