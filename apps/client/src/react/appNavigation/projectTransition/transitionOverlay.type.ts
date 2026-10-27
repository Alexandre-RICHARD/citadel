import type { TransitionEffectEnum } from "./transitionEffect.enum";
import type { TransitionPalette } from "./transitionPalette.type";
import type { TransitionPoint } from "./transitionPoint.type";
import type { TransitionTip } from "./transitionTip.type";

// Ce que le composant ProjectTransition, monté une fois pour toute l'application, met à disposition
export type TransitionOverlay = {
	cover: (
		effect: TransitionEffectEnum,
		palette: TransitionPalette,
		isDark: boolean,
		origin: TransitionPoint,
	) => Promise<void>;
	reveal: () => Promise<void>;
	showTip: (tip: TransitionTip) => void;
	hideTip: () => Promise<void>;
};
