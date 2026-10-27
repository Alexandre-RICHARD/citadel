import type { TransitionPoint } from "../transitionPoint.type";
import { createCellWave } from "./createCellWave";
import { traceHexagon } from "./traceHexagon";
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
	const columnStep = HEX_RADIUS * 1.5;
	const rowStep = HEX_RADIUS * Math.sqrt(3);
	const cells: TransitionPoint[] = [];
	for (let column = -1; column * columnStep < width + HEX_RADIUS; column++) {
		for (let row = -1; row * rowStep < height + HEX_RADIUS; row++) {
			cells.push({
				x: column * columnStep,
				y: row * rowStep + (column % 2 ? rowStep / 2 : 0),
			});
		}
	}

	return createCellWave(cells, palette, origin, (context, cell, scale) => {
		// Un peu plus grands que la grille : pas de jour entre deux cases posées
		traceHexagon(context, cell, HEX_RADIUS * 1.04 * scale);
		context.fill();
	});
}
