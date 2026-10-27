import type { Point } from "./point.type.ts";

// Centres d'une grille d'hexagones à pointes horizontales qui couvre width × height, bords compris
export function getHexGridCenters(
	width: number,
	height: number,
	radius: number,
): Point[] {
	const columnStep = radius * 1.5;
	const rowStep = radius * Math.sqrt(3);
	const centers: Point[] = [];
	for (let column = -1; column * columnStep < width + radius; column++) {
		for (let row = -1; row * rowStep < height + radius; row++) {
			centers.push({
				x: column * columnStep,
				// Une colonne sur deux descend d'une demi-case : les hexagones s'emboîtent
				y: row * rowStep + (column % 2 ? rowStep / 2 : 0),
			});
		}
	}
	return centers;
}
