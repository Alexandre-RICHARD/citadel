import type { BackgroundEffectPalette } from "./backgroundEffectPalette.type";

// Ce qu'un fond animé reçoit à chaque image ; dimensions en pixels CSS, temps en secondes
export type BackgroundEffectFrame = {
	width: number;
	height: number;
	time: number;
	deltaTime: number;
	palette: BackgroundEffectPalette;
};
