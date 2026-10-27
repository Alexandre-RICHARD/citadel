import { hexToRgba } from "@citadel/common/src/universal/color/hexToRgba";

import type { BackgroundEffect } from "./backgroundEffect.type";
import { randomBetween } from "./randomBetween";

type FloatingShape = {
	x: number;
	y: number;
	size: number;
	speedY: number;
	rotation: number;
	rotationSpeed: number;
	kind: "circle" | "square" | "triangle" | "check";
	isAccent: boolean;
};

const SHAPE_COUNT = 14;
const SHAPE_KINDS = ["circle", "square", "triangle", "check"] as const;
// Les formes restent sur la droite de l'écran, loin du texte de la présentation
const MIN_X = 0.68;

function traceShape(
	context: CanvasRenderingContext2D,
	kind: FloatingShape["kind"],
	size: number,
): void {
	context.beginPath();
	if (kind === "circle") context.arc(0, 0, size, 0, Math.PI * 2);
	else if (kind === "square")
		context.roundRect(-size, -size, 2 * size, 2 * size, size * 0.35);
	else if (kind === "triangle") {
		context.moveTo(0, -size);
		context.lineTo(size * 0.95, size * 0.7);
		context.lineTo(-size * 0.95, size * 0.7);
		context.closePath();
	} else {
		context.moveTo(-size, 0);
		context.lineTo(-size * 0.3, size * 0.7);
		context.lineTo(size, -size * 0.6);
	}
}

// Backlog : des formes au trait qui flottent vers le haut (cercle, carré, triangle, coche), comme des cases à cocher
export function createShapesEffect(): BackgroundEffect {
	let shapes: FloatingShape[] = [];

	function scatter(width: number, height: number): void {
		shapes = Array.from({ length: SHAPE_COUNT }, () => ({
			x: randomBetween(MIN_X, 1) * width,
			y: randomBetween(0, height),
			size: randomBetween(9, 22),
			speedY: randomBetween(6, 14),
			rotation: randomBetween(0, Math.PI * 2),
			rotationSpeed: randomBetween(-0.25, 0.25),
			kind: SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)],
			isAccent: Math.random() < 0.3,
		}));
	}

	return {
		resize: scatter,
		draw(context, { width, height, deltaTime, palette }) {
			if (shapes.length === 0) scatter(width, height);
			context.lineWidth = 2.2;
			context.lineJoin = "round";
			context.lineCap = "round";
			for (const shape of shapes) {
				shape.y -= shape.speedY * deltaTime;
				shape.rotation += shape.rotationSpeed * deltaTime;
				// Sortie par le haut : elle revient par le bas, ailleurs
				if (shape.y < -40) {
					shape.y = height + 40;
					shape.x = randomBetween(MIN_X, 1) * width;
				}
				context.save();
				context.translate(shape.x, shape.y);
				context.rotate(shape.rotation);
				context.strokeStyle = shape.isAccent
					? hexToRgba(palette.accent, 0.55)
					: hexToRgba(palette.text, 0.18);
				traceShape(context, shape.kind, shape.size);
				context.stroke();
				context.restore();
			}
		},
	};
}
