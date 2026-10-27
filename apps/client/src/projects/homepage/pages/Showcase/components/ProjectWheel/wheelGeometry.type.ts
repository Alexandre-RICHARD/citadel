import type { WheelOrientationEnum } from "./wheelOrientation.enum";

// Le cercle dont la roue est un arc, en pixels dans la roue
export type WheelGeometry = {
	orientation: WheelOrientationEnum;
	width: number;
	height: number;
	radius: number;
	centerX: number;
	centerY: number;
	// Écart entre deux boîtes le long de l'arc, en pixels et en radians
	spacing: number;
	step: number;
	// Le bouton qui désélectionne, dans le creux de l'arc
	clearButtonX: number;
	clearButtonY: number;
};
