// Trace un hexagone à pointes horizontales (sans le remplir), tourné de rotation radians
export function traceHexagon(
	context: CanvasRenderingContext2D,
	center: { x: number; y: number },
	radius: number,
	rotation = 0,
): void {
	context.beginPath();
	for (let corner = 0; corner < 6; corner++) {
		const angle = rotation + (Math.PI / 3) * corner;
		const x = center.x + radius * Math.cos(angle);
		const y = center.y + radius * Math.sin(angle);
		if (corner === 0) context.moveTo(x, y);
		else context.lineTo(x, y);
	}
	context.closePath();
}
