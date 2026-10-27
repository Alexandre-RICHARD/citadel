import { easeOutBack } from "@citadel/common/src/universal/animation/easeOutBack";
import { mixHexColors } from "@citadel/common/src/universal/color/mixHexColors";
import { clamp } from "@citadel/common/src/universal/number/clamp";

import type { TransitionPalette } from "../transitionPalette.type";
import { TransitionPhaseEnum } from "../transitionPhase.enum";
import type { TransitionPoint } from "../transitionPoint.type";
import type { TransitionPainter } from "./transitionPainter.type";

type WaveCell = TransitionPoint & {
	// 0 pour la case la plus proche du point de départ, 1 pour la plus lointaine
	distance: number;
	color: string;
};

// Dessine une case, déjà remplie de sa couleur : scale de 0 à 1 (dépasse 1 quand elle saute en place),
// settled de 0 à 1 quand elle se pose
type DrawCell = (
	context: CanvasRenderingContext2D,
	cell: TransitionPoint,
	scale: number,
	settled: number,
) => void;

// Une vague de cases depuis le point cliqué : chaque case s'allume aux couleurs du projet, puis se fond
// dans son fond. Au retour, la vague repart dans l'autre sens
export function createCellWave(
	points: TransitionPoint[],
	palette: TransitionPalette,
	origin: TransitionPoint,
	drawCell: DrawCell,
): TransitionPainter {
	const distances = points.map((point) =>
		Math.hypot(point.x - origin.x, point.y - origin.y),
	);
	const maxDistance = Math.max(...distances) || 1;
	const { decorations } = palette;
	const cells: WaveCell[] = points.map((point, index) => ({
		...point,
		distance: distances[index] / maxDistance,
		// Une case sur quatre environ prend la couleur principale, les autres une couleur de décoration
		color:
			Math.random() < 0.25 || decorations.length === 0
				? palette.accent
				: decorations[Math.floor(Math.random() * decorations.length)],
	}));

	return {
		draw(context, { phase, progress }) {
			for (const cell of cells) {
				const cellProgress = clamp(
					(progress - cell.distance * 0.55) / 0.45,
					0,
					1,
				);
				const visible =
					phase === TransitionPhaseEnum.Cover ? cellProgress : 1 - cellProgress;
				if (visible <= 0) continue;
				context.fillStyle = mixHexColors(
					cell.color,
					palette.background,
					visible ** 4,
				);
				drawCell(
					context,
					cell,
					phase === TransitionPhaseEnum.Cover ? easeOutBack(visible) : visible,
					visible,
				);
			}
		},
	};
}
