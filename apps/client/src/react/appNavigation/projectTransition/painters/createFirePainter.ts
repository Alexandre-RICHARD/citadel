import { easeInOutCubic } from "@citadel/common/src/universal/animation/easeInOutCubic";

import { TransitionPhaseEnum } from "../transitionPhase.enum";
import type { TransitionPainter } from "./transitionPainter.type";
import type { TransitionPainterOptions } from "./transitionPainterOptions.type";

type Ember = {
	x: number;
	y: number;
	speedX: number;
	speedY: number;
	life: number;
	age: number;
	size: number;
};

const EDGE_STEP = 16;
const EMBERS_PER_FRAME = 4;

// Game Death Counter : un rideau sombre monte, son bord ondule et rougeoie, des braises s'en échappent.
// Au retour, il se consume vers le haut
export function createFirePainter({
	width,
	height,
	palette,
	isDark,
}: TransitionPainterOptions): TransitionPainter {
	const embers: Ember[] = [];
	const glow = isDark ? "#ff7a1a" : "#e2550c";

	// Hauteur du bord à l'abscisse x : trois ondulations superposées, qui bougent avec le temps
	function getEdgeY(x: number, base: number, time: number): number {
		return (
			base +
			26 * Math.sin(x * 0.012 + time * 2.1) +
			14 * Math.sin(x * 0.031 - time * 3.3) +
			8 * Math.sin(x * 0.07 + time * 5)
		);
	}

	function traceEdge(
		context: CanvasRenderingContext2D,
		base: number,
		time: number,
	): void {
		context.moveTo(0, getEdgeY(0, base, time));
		for (let x = EDGE_STEP; x <= width + EDGE_STEP; x += EDGE_STEP)
			context.lineTo(x, getEdgeY(x, base, time));
	}

	return {
		draw(context, { phase, progress, time, deltaTime }) {
			const base = height + 120 - easeInOutCubic(progress) * (height + 260);

			// Le rideau : sous le bord à l'aller, au-dessus au retour
			context.beginPath();
			traceEdge(context, base, time);
			const closingY = phase === TransitionPhaseEnum.Cover ? height + 10 : -10;
			context.lineTo(width + EDGE_STEP, closingY);
			context.lineTo(0, closingY);
			context.closePath();
			context.fillStyle = palette.background;
			context.fill();

			// Le bord qui rougeoie
			context.save();
			context.beginPath();
			traceEdge(context, base, time);
			context.shadowColor = glow;
			context.shadowBlur = 28;
			context.strokeStyle = glow;
			context.lineWidth = 5;
			context.stroke();
			context.shadowBlur = 0;
			context.strokeStyle = "#ffd27a";
			context.lineWidth = 1.6;
			context.stroke();
			context.restore();

			// Des braises naissent sur le bord tant qu'il est à l'écran
			if (base > -60 && base < height + 60) {
				for (let index = 0; index < EMBERS_PER_FRAME; index++) {
					const x = Math.random() * width;
					embers.push({
						x,
						y: getEdgeY(x, base, time),
						speedX: (Math.random() - 0.5) * 30,
						speedY: 40 + Math.random() * 90,
						life: 0.8 + Math.random(),
						age: 0,
						size: 1 + Math.random() * 2,
					});
				}
			}

			context.globalCompositeOperation = isDark ? "lighter" : "source-over";
			for (let index = embers.length - 1; index >= 0; index--) {
				const ember = embers[index];
				ember.age += deltaTime;
				if (ember.age > ember.life) {
					embers.splice(index, 1);
					continue;
				}
				ember.y -= ember.speedY * deltaTime;
				ember.x += ember.speedX * deltaTime;
				context.fillStyle = `rgba(255,170,60,${0.9 * (1 - ember.age / ember.life)})`;
				context.beginPath();
				context.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
				context.fill();
			}
			context.globalCompositeOperation = "source-over";
		},
	};
}
