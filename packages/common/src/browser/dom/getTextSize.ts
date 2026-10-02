let measuringContext: CanvasRenderingContext2D | undefined;

function getMeasuringContext(): CanvasRenderingContext2D {
	measuringContext ??=
		document.createElement("canvas").getContext("2d") ?? undefined;
	if (!measuringContext) {
		throw new Error("getTextSize → canvas 2D context is not available");
	}
	return measuringContext;
}

// Largeur en pixels du texte une fois affiché avec cette police
export function getTextSize(
	text: string,
	fontSize: number,
	fontFamily: string,
	fontWeight = "normal",
): number {
	const context = getMeasuringContext();
	context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
	return context.measureText(text).width;
}
