import type { TransitionPoint } from "../transitionPoint.type";
import { createCellWave } from "./createCellWave";
import type { TransitionPainter } from "./transitionPainter.type";
import type { TransitionPainterOptions } from "./transitionPainterOptions.type";

const TILE_SIZE = 76;
const TILE_RADIUS = 18;

// Backlog : des tuiles arrondies qui sautent en place, et perdent leurs arrondis une fois posées
export function createTilesPainter({
	width,
	height,
	palette,
	origin,
}: TransitionPainterOptions): TransitionPainter {
	const cells: TransitionPoint[] = [];
	for (let column = 0; column * TILE_SIZE < width + TILE_SIZE; column++) {
		for (let row = 0; row * TILE_SIZE < height + TILE_SIZE; row++) {
			cells.push({
				x: column * TILE_SIZE + TILE_SIZE / 2,
				y: row * TILE_SIZE + TILE_SIZE / 2,
			});
		}
	}

	return createCellWave(
		cells,
		palette,
		origin,
		(context, cell, scale, settled) => {
			// Un pixel de plus que la grille : pas de jour entre deux tuiles posées
			const size = (TILE_SIZE + 1) * scale;
			context.beginPath();
			context.roundRect(
				cell.x - size / 2,
				cell.y - size / 2,
				size,
				size,
				TILE_RADIUS * (1 - settled),
			);
			context.fill();
		},
	);
}
