import { clamp } from "@citadel/common/src/universal/number/clamp";

import type { WheelGeometry } from "./wheelGeometry.type";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

// Le cercle de la roue, pour une roue de width × height. null tant qu'elle n'a pas de taille (vue masquée)
export function computeWheelGeometry(
	width: number,
	height: number,
	orientation: WheelOrientationEnum,
): WheelGeometry | null {
	if (!width || !height) return null;

	if (orientation === WheelOrientationEnum.Vertical) {
		const radius = Math.max(height * 0.62, 300);
		// Abscisse de la boîte du centre : l'arc bombe vers la droite, son centre est hors de la roue, à gauche
		const centerItemX = clamp(width * 0.28, 90, 160);
		const spacing = clamp(height * 0.12, 62, 84);
		return {
			orientation,
			width,
			height,
			radius,
			centerX: centerItemX - radius,
			centerY: height / 2,
			spacing,
			step: spacing / radius,
			clearButtonX: Math.max(26, centerItemX - 62),
			clearButtonY: height / 2,
		};
	}

	const radius = Math.max(width * 1.5, 520);
	// Ordonnée de la boîte du centre : l'arc bombe vers le bas, son centre est au-dessus de l'écran
	const centerItemY = 96;
	const spacing = clamp(width * 0.42, 140, 190);
	return {
		orientation,
		width,
		height,
		radius,
		centerX: width / 2,
		centerY: centerItemY - radius,
		spacing,
		step: spacing / radius,
		clearButtonX: width / 2,
		clearButtonY: 36,
	};
}
