import type { BackgroundEffectFrame } from "./backgroundEffectFrame.type";

// Un fond animé : il dessine une image sur un canvas déjà effacé, et se recale quand l'écran change de taille
export type BackgroundEffect = {
	draw: (
		context: CanvasRenderingContext2D,
		frame: BackgroundEffectFrame,
	) => void;
	resize?: (width: number, height: number) => void;
};
