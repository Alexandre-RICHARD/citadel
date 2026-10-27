import { hexToRgba } from "@citadel/common/src/universal/color/hexToRgba";

import { irigoLineColors } from "../../../../react/appNavigation/showcase/irigoLineColors";
import type { BackgroundEffect } from "./backgroundEffect.type";
import { randomBetween } from "./randomBetween";

type Train = {
	color: string;
	// Abscisse de la voie, en bas de l'écran
	trackX: number;
	length: number;
	speed: number;
	// Distance parcourue depuis le départ
	travelled: number;
};

const ANGLE = (62 * Math.PI) / 180;
const DIRECTION_X = Math.cos(ANGLE);
const DIRECTION_Y = -Math.sin(ANGLE);
const NARROW_MAX_WIDTH = 720;
// Écart entre deux rames sur une même voie, en pixels parcourus
const SECOND_TRAIN_OFFSET = 700;

// Angers Irigo : les couleurs des lignes, en bandes arrondies qui glissent en diagonale, une voie par ligne
export function createStripesEffect(): BackgroundEffect {
	let trains: Train[] = [];

	// Les bandes montent vers la droite : elles partent assez à gauche pour croiser l'écran à mi-hauteur
	// vers 80 % de la largeur (55 % sur téléphone, où l'écran est étroit et haut)
	function layOut(width: number, height: number): void {
		const isNarrow = width <= NARROW_MAX_WIDTH;
		const gap = isNarrow ? 24 : Math.max(30, width * 0.03);
		const firstTrackX =
			width * (isNarrow ? 0.55 : 0.8) -
			(height / 2) * (DIRECTION_X / Math.sin(ANGLE)) -
			(gap * irigoLineColors.length) / 2;
		trains = irigoLineColors.flatMap((color, index) => {
			const length = randomBetween(120, 260);
			const speed = randomBetween(16, 28);
			const travelled = randomBetween(0, 1000);
			const trackX = firstTrackX + index * gap;
			// Deux rames par voie, décalées
			return [
				{ color, trackX, length, speed, travelled },
				{
					color,
					trackX,
					length: length * 0.6,
					speed,
					travelled: travelled + SECOND_TRAIN_OFFSET,
				},
			];
		});
	}

	return {
		resize: layOut,
		draw(context, { width, height, deltaTime, palette }) {
			if (trains.length === 0) layOut(width, height);
			context.lineCap = "round";
			context.lineWidth = Math.max(9, width * 0.01);
			const span = height / Math.sin(ANGLE);
			for (const train of trains) {
				train.travelled += train.speed * deltaTime;
				// Un tour : traverser l'écran, plus une pause hors champ
				const loop = span + train.length + 900;
				const position = (train.travelled % loop) - train.length - 50;
				context.strokeStyle = hexToRgba(
					train.color,
					palette.isDark ? 0.5 : 0.6,
				);
				context.beginPath();
				context.moveTo(
					train.trackX + DIRECTION_X * position,
					height + DIRECTION_Y * position,
				);
				context.lineTo(
					train.trackX + DIRECTION_X * (position + train.length),
					height + DIRECTION_Y * (position + train.length),
				);
				context.stroke();
			}
		},
	};
}
