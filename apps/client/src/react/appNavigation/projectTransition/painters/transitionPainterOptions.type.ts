import type { TransitionPalette } from "../transitionPalette.type";
import type { TransitionPoint } from "../transitionPoint.type";

export type TransitionPainterOptions = {
	width: number;
	height: number;
	palette: TransitionPalette;
	origin: TransitionPoint;
	isDark: boolean;
};
