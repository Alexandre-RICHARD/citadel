import type { TransitionPhaseEnum } from "../transitionPhase.enum";

// Ce qu'un peintre reçoit à chaque image
export type TransitionFrame = {
	phase: TransitionPhaseEnum;
	// Avancement de la phase, de 0 à 1
	progress: number;
	// Secondes écoulées depuis le début de la transition, et depuis l'image précédente
	time: number;
	deltaTime: number;
};
