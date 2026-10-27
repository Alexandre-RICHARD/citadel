import { easeInOutCubic } from "@citadel/common/src/universal/animation/easeInOutCubic";

import { TransitionPhaseEnum } from "../transitionPhase.enum";
import { traceHexagon } from "./traceHexagon";
import type { TransitionPainter } from "./transitionPainter.type";
import type { TransitionPainterOptions } from "./transitionPainterOptions.type";

// Par défaut : l'hexagone du logo s'ouvre depuis le bouton, bordé de la couleur du projet ;
// au retour, il s'ouvre au centre de l'écran et laisse voir la page
export function createHexPainter({
	width,
	height,
	palette,
	origin,
}: TransitionPainterOptions): TransitionPainter {
	const corners = [
		[0, 0],
		[width, 0],
		[0, height],
		[width, height],
	] as const;
	const farthestCorner = Math.max(
		...corners.map(([x, y]) => Math.hypot(x - origin.x, y - origin.y)),
	);
	const maxRadius = farthestCorner * 1.25;
	const center = { x: width / 2, y: height / 2 };

	return {
		draw(context, { phase, progress }) {
			const eased = easeInOutCubic(progress);
			const radius = eased * maxRadius;
			// Le fond suit l'hexagone de couleur avec un temps de retard : il reste une bordure
			const innerRadius = Math.max(0, (eased - 0.12) / 0.88) * maxRadius;
			const rotation = eased * 0.6;

			if (phase === TransitionPhaseEnum.Cover) {
				traceHexagon(context, origin, radius, rotation);
				context.fillStyle = palette.accent;
				context.fill();
				traceHexagon(context, origin, innerRadius, rotation);
				context.fillStyle = palette.background;
				context.fill();
				return;
			}

			context.fillStyle = palette.background;
			context.fillRect(0, 0, width, height);
			traceHexagon(context, center, radius, rotation);
			context.fillStyle = palette.accent;
			context.fill();
			context.globalCompositeOperation = "destination-out";
			traceHexagon(context, center, innerRadius, rotation);
			context.fill();
			context.globalCompositeOperation = "source-over";
		},
	};
}
