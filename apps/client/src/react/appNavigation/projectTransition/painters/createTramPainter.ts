import { easeInOutCubic } from "@citadel/common/src/universal/animation/easeInOutCubic";

import { irigoLineColors } from "../../showcase/irigoLineColors";
import { TransitionPhaseEnum } from "../transitionPhase.enum";
import type { TransitionPainter } from "./transitionPainter.type";
import type { TransitionPainterOptions } from "./transitionPainterOptions.type";

const STRIPE_WIDTH = 18;
const STRIPE_GAP = 10;
// Les bandes sont inclinées comme celles du fond animé d'Irigo
const STRIPE_ANGLE = (62 * Math.PI) / 180;

// Angers Irigo : un tram passe en diagonale. Les couleurs des lignes en tête, le fond derrière ; au retour, en queue
export function createTramPainter({
	width,
	height,
	palette,
}: TransitionPainterOptions): TransitionPainter {
	const normalX = Math.sin(STRIPE_ANGLE);
	const normalY = Math.cos(STRIPE_ANGLE);
	// Étendue de l'écran le long du sens de passage
	const corners = [
		[0, 0],
		[width, 0],
		[0, height],
		[width, height],
	] as const;
	const projections = corners.map(([x, y]) => x * normalX + y * normalY);
	const start = Math.min(...projections);
	const end = Math.max(...projections);
	const bandWidth = irigoLineColors.length * (STRIPE_WIDTH + STRIPE_GAP);
	// Assez long pour couvrir l'écran une fois tourné
	const reach = Math.hypot(width, height) * 2;
	const travel = end - start + bandWidth;

	return {
		draw(context, { phase, progress }) {
			const eased = easeInOutCubic(progress);
			context.save();
			context.rotate(Math.atan2(normalY, normalX));

			if (phase === TransitionPhaseEnum.Cover) {
				const front = start - bandWidth + eased * travel;
				context.fillStyle = palette.background;
				context.fillRect(start - 10, -reach, front - start + 10, 2 * reach);
				irigoLineColors.forEach((color, index) => {
					context.fillStyle = color;
					context.fillRect(
						front + STRIPE_GAP + index * (STRIPE_WIDTH + STRIPE_GAP),
						-reach,
						STRIPE_WIDTH,
						2 * reach,
					);
				});
			} else {
				const tail = start + eased * travel;
				context.fillStyle = palette.background;
				context.fillRect(tail, -reach, end + 10 - tail, 2 * reach);
				irigoLineColors.forEach((color, index) => {
					context.fillStyle = color;
					context.fillRect(
						tail - (index + 1) * (STRIPE_WIDTH + STRIPE_GAP),
						-reach,
						STRIPE_WIDTH,
						2 * reach,
					);
				});
			}

			context.restore();
		},
	};
}
