import { clamp } from "@citadel/common/src/universal/number/clamp";

import { getPointOnWheel } from "./getPointOnWheel";
import type { WheelGeometry } from "./wheelGeometry.type";
import type { WheelItemPlacement } from "./wheelItemPlacement.type";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

// Au-delà, la boîte est trop loin sur l'arc pour se voir
const MAX_VISIBLE_DISTANCE = 4.8;

// Où poser une boîte : offset est sa distance à la boîte du centre, en nombre de boîtes (fractionnaire pendant
// que la roue tourne). La boîte du centre est la plus grande, les autres rapetissent et s'estompent
export function getWheelItemPlacement(
	offset: number,
	geometry: WheelGeometry,
): WheelItemPlacement {
	const distance = Math.abs(offset);
	const zIndex = 100 - Math.round(distance * 10);
	if (distance > MAX_VISIBLE_DISTANCE)
		return { isVisible: false, transform: "", opacity: 0, zIndex };

	const isVertical = geometry.orientation === WheelOrientationEnum.Vertical;
	const angle = offset * geometry.step;
	const [x, y] = getPointOnWheel(geometry, angle, geometry.radius);
	const scale =
		(1 + 0.14 * Math.max(0, 1 - distance)) * Math.max(0.6, 1 - 0.08 * distance);
	// Les boîtes suivent la courbe, un peu moins inclinées qu'elle
	const rotation = isVertical ? angle * 0.55 : -angle * 0.6;
	// Accrochées par le milieu de leur bord gauche (vertical) ou de leur bord haut (horizontal)
	const anchor = isVertical ? "translate(0,-50%)" : "translate(-50%,0)";

	return {
		isVisible: true,
		transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rotation.toFixed(4)}rad) scale(${scale.toFixed(3)}) ${anchor}`,
		opacity: clamp(1 - 0.22 * distance, 0, 1),
		zIndex,
	};
}
