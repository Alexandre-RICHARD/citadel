import type { WheelGeometry } from "./wheelGeometry.type";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

// Le point de l'arc à angle radians de la boîte du centre, à distance radius du centre du cercle
export function getPointOnWheel(
	geometry: WheelGeometry,
	angle: number,
	radius: number,
): [number, number] {
	return geometry.orientation === WheelOrientationEnum.Vertical
		? [
				geometry.centerX + radius * Math.cos(angle),
				geometry.centerY + radius * Math.sin(angle),
			]
		: [
				geometry.centerX + radius * Math.sin(angle),
				geometry.centerY + radius * Math.cos(angle),
			];
}
