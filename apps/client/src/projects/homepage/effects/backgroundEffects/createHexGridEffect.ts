import { traceHexagon } from "@citadel/common/src/browser/canvas/traceHexagon";
import { hexToRgba } from "@citadel/common/src/universal/color/hexToRgba";
import { getHexGridCenters } from "@citadel/common/src/universal/geometry/getHexGridCenters";
import type { Point } from "@citadel/common/src/universal/geometry/point.type";
import { pickRandomItem } from "@citadel/common/src/universal/random/pickRandomItem";
import { randomBetween } from "@citadel/common/src/universal/random/randomBetween";

import type { BackgroundEffect } from "./backgroundEffect.type";
import type { BackgroundEffectPalette } from "./backgroundEffectPalette.type";

type Pulse = {
	center: Point;
	startedAt: number;
};

const HEX_RADIUS = 30;
const SCAN_SPEED = 45;
const SCAN_REACH = 110;
const PULSE_SECONDS = 2.5;

// Satisfactory : une grille hexagonale discrète, une ligne de balayage qui la parcourt, et des cases qui
// s'allument çà et là, comme des machines qui démarrent
export function createHexGridEffect(): BackgroundEffect {
	let grid: OffscreenCanvas | null = null;
	let gridKey = "";
	let cells: Point[] = [];
	let pulses: Pulse[] = [];
	let nextPulseAt = 0;

	// La grille fixe est dessinée une fois, hors écran, puis recopiée à chaque image
	function buildGrid(
		width: number,
		height: number,
		palette: BackgroundEffectPalette,
	) {
		grid = new OffscreenCanvas(Math.max(1, width), Math.max(1, height));
		const gridContext = grid.getContext("2d");
		cells = getHexGridCenters(width, height, HEX_RADIUS);
		if (!gridContext) return;
		gridContext.strokeStyle = hexToRgba(palette.text, 0.07);
		gridContext.lineWidth = 1;
		gridContext.beginPath();
		for (const cell of cells) traceHexagon(gridContext, cell, HEX_RADIUS - 2);
		gridContext.stroke();
	}

	return {
		resize() {
			gridKey = "";
		},
		draw(context, { width, height, time, palette }) {
			const key = `${width}x${height}|${palette.text}`;
			if (key !== gridKey) {
				gridKey = key;
				buildGrid(width, height, palette);
			}
			if (grid) context.drawImage(grid, 0, 0, width, height);

			// La ligne de balayage éclaire les cases qu'elle croise
			const scanY = ((time * SCAN_SPEED) % (height + 400)) - 200;
			context.lineWidth = 1.5;
			for (const cell of cells) {
				const distance = Math.abs(cell.y - scanY);
				if (distance > SCAN_REACH) continue;
				context.strokeStyle = hexToRgba(
					palette.text,
					0.28 * (1 - distance / SCAN_REACH),
				);
				context.beginPath();
				traceHexagon(context, cell, HEX_RADIUS - 2);
				context.stroke();
			}

			// Une case s'allume toutes les 0,3 s environ, et s'éteint en 2,5 s
			const pulseCenter =
				time > nextPulseAt ? pickRandomItem(cells) : undefined;
			if (pulseCenter !== undefined) {
				nextPulseAt = time + randomBetween(0.15, 0.45);
				pulses.push({ center: pulseCenter, startedAt: time });
			}
			pulses = pulses.filter((pulse) => time - pulse.startedAt < PULSE_SECONDS);
			for (const { center, startedAt } of pulses) {
				context.fillStyle = hexToRgba(
					palette.accent,
					0.26 * (1 - (time - startedAt) / PULSE_SECONDS),
				);
				context.beginPath();
				traceHexagon(context, center, HEX_RADIUS - 4);
				context.fill();
			}
		},
	};
}
