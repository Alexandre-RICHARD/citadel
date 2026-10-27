// Taille en pixels de l'image du canvas, arrondie et jamais nulle : un canvas de 0 pixel ne dessine plus rien
export function setCanvasResolution(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
): void {
	canvas.setAttribute("width", String(Math.max(1, Math.round(width))));
	canvas.setAttribute("height", String(Math.max(1, Math.round(height))));
}
