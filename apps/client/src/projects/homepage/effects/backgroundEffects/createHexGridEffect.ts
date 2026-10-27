import { hexToRgba } from "@citadel/common/src/universal/color/hexToRgba";

import type { BackgroundEffect } from "./backgroundEffect.type";
import type { BackgroundEffectPalette } from "./backgroundEffectPalette.type";
import { randomBetween } from "./randomBetween";

type Pulse = {
	center: [number, number];
	startedAt: number;
};

const HEX_RADIUS = 30;
const SCAN_SPEED = 45;
const SCAN_REACH = 110;
const PULSE_SECONDS = 2.5;

function traceHexagon(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
): void {
	for (let corner = 0; corner < 6; corner++) {
		const angle = (Math.PI / 3) * corner;
		const pointX = x + radius * Math.cos(angle);
		const pointY = y + radius * Math.sin(angle);
		if (corner === 0) context.moveTo(pointX, pointY);
		else context.lineTo(pointX, pointY);
	}
	context.closePath();
}

// Satisfactory : une grille hexagonale discrète, une ligne de balayage qui la parcourt, et des cases qui
// s'allument çà et là, comme des machines qui démarrent
export function createHexGridEffect(): BackgroundEffect {
	let grid: OffscreenCanvas | null = null;
	let gridKey = "";
	let cells: [number, number][] = [];
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
		const columnStep = HEX_RADIUS * 1.5;
		const rowStep = HEX_RADIUS * Math.sqrt(3);
		cells = [];
		for (let column = -1; column * columnStep < width + HEX_RADIUS; column++) {
			for (let row = -1; row * rowStep < height + HEX_RADIUS; row++) {
				cells.push([
					column * columnStep,
					row * rowStep + (column % 2 ? rowStep / 2 : 0),
				]);
			}
		}
		if (!gridContext) return;
		gridContext.strokeStyle = hexToRgba(palette.text, 0.07);
		gridContext.lineWidth = 1;
		gridContext.beginPath();
		for (const [x, y] of cells) traceHexagon(gridContext, x, y, HEX_RADIUS - 2);
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
			for (const [x, y] of cells) {
				const distance = Math.abs(y - scanY);
				if (distance > SCAN_REACH) continue;
				context.strokeStyle = hexToRgba(
					palette.text,
					0.28 * (1 - distance / SCAN_REACH),
				);
				context.beginPath();
				traceHexagon(context, x, y, HEX_RADIUS - 2);
				context.stroke();
			}

			// Une case s'allume toutes les 0,3 s environ, et s'éteint en 2,5 s
			if (time > nextPulseAt && cells.length > 0) {
				nextPulseAt = time + randomBetween(0.15, 0.45);
				const center = cells[Math.floor(Math.random() * cells.length)];
				pulses.push({ center, startedAt: time });
			}
			pulses = pulses.filter((pulse) => time - pulse.startedAt < PULSE_SECONDS);
			for (const { center, startedAt } of pulses) {
				context.fillStyle = hexToRgba(
					palette.accent,
					0.26 * (1 - (time - startedAt) / PULSE_SECONDS),
				);
				context.beginPath();
				traceHexagon(context, center[0], center[1], HEX_RADIUS - 4);
				context.fill();
			}
		},
	};
}
