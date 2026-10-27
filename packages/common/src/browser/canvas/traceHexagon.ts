import type { Point } from "../../universal/geometry/point.type.ts";

/**
 * Ajoute au chemin en cours un hexagone à pointes horizontales, tourné de rotation radians, sans le dessiner.
 * Plusieurs hexagones peuvent partager un chemin (une grille tracée d'un seul stroke) : l'appelant ouvre le chemin
 */
export function traceHexagon(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	center: Point,
	radius: number,
	rotation = 0,
): void {
	for (let corner = 0; corner < 6; corner++) {
		const angle = rotation + (Math.PI / 3) * corner;
		const x = center.x + radius * Math.cos(angle);
		const y = center.y + radius * Math.sin(angle);
		if (corner === 0) context.moveTo(x, y);
		else context.lineTo(x, y);
	}
	context.closePath();
}
