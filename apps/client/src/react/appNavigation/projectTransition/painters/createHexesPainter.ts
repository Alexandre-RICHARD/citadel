import { traceHexagon } from "@citadel/common/src/browser/canvas/traceHexagon";
import { getHexGridCenters } from "@citadel/common/src/universal/geometry/getHexGridCenters";

import { createCellWave } from "./createCellWave";
import type { TransitionPainter } from "./transitionPainter.type";
import type { TransitionPainterOptions } from "./transitionPainterOptions.type";

const HEX_RADIUS = 42;

// Satisfactory : des hexagones qui se posent en vague, comme une usine qui se construit
export function createHexesPainter({
	width,
	height,
	palette,
	origin,
}: TransitionPainterOptions): TransitionPainter {
	return createCellWave(
		getHexGridCenters(width, height, HEX_RADIUS),
		palette,
		origin,
		(context, cell, scale) => {
			// Un peu plus grands que la grille : pas de jour entre deux cases posées
			context.beginPath();
			traceHexagon(context, cell, HEX_RADIUS * 1.04 * scale);
			context.fill();
		},
	);
}
