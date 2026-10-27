import { hexToRgba } from "@citadel/common/src/universal/color/hexToRgba";

import type { BackgroundEffect } from "./backgroundEffect.type";
import { randomBetween } from "./randomBetween";

type Ember = {
	x: number;
	y: number;
	speedY: number;
	life: number;
	age: number;
	size: number;
	swayAmplitude: number;
	swaySpeed: number;
	phase: number;
	isHot: boolean;
};

const MAX_EMBERS = 120;

// Game Death Counter : des braises qui montent en se balançant et en vacillant. Les seules à passer devant les blobs :
// elles flottent dans l'air
export function createEmbersEffect(): BackgroundEffect {
	const embers: Ember[] = [];
	let pending = 0;

	return {
		draw(context, { width, height, time, deltaTime, palette }) {
			// Plus de braises sur un grand écran
			pending += deltaTime * Math.max(8, (width / 1440) * 24);
			while (pending > 1 && embers.length < MAX_EMBERS) {
				pending -= 1;
				embers.push({
					x: randomBetween(0.2, 1) * width,
					y: height + 10,
					speedY: randomBetween(18, 48),
					life: randomBetween(5, 10),
					age: 0,
					size: randomBetween(0.8, 2.4),
					swayAmplitude: randomBetween(6, 22),
					swaySpeed: randomBetween(0.4, 1.3),
					phase: randomBetween(0, Math.PI * 2),
					isHot: Math.random() > 0.6,
				});
			}

			context.globalCompositeOperation = palette.isDark
				? "lighter"
				: "source-over";
			for (let index = embers.length - 1; index >= 0; index--) {
				const ember = embers[index];
				ember.age += deltaTime;
				ember.y -= ember.speedY * deltaTime;
				if (ember.age > ember.life || ember.y < -20) {
					embers.splice(index, 1);
					continue;
				}
				const fade = Math.min(1, ember.age * 2) * (1 - ember.age / ember.life);
				const flicker = 0.6 + 0.4 * Math.sin(time * 9 + ember.phase * 3);
				const x =
					ember.x +
					Math.sin(time * ember.swaySpeed + ember.phase) * ember.swayAmplitude;
				const color = ember.isHot
					? "#ffd27a"
					: palette.isDark
						? "#ff8a2a"
						: "#d9480f";
				// Une lueur large et pâle, puis le point chaud
				context.fillStyle = hexToRgba(color, 0.12 * fade * flicker);
				context.beginPath();
				context.arc(x, ember.y, ember.size * 4, 0, Math.PI * 2);
				context.fill();
				context.fillStyle = hexToRgba(color, 0.9 * fade * flicker);
				context.beginPath();
				context.arc(x, ember.y, ember.size, 0, Math.PI * 2);
				context.fill();
			}
			context.globalCompositeOperation = "source-over";
		},
	};
}
