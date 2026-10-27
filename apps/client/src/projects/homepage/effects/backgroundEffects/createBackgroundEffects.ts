import { BackgroundEffectEnum } from "../../../../react/appNavigation/showcase/backgroundEffect.enum";
import type { BackgroundEffect } from "./backgroundEffect.type";
import { backgroundEffectFactories } from "./backgroundEffectFactories";
import type { BackgroundEffectPalette } from "./backgroundEffectPalette.type";

type Layer = {
	kind: BackgroundEffectEnum;
	effect: BackgroundEffect;
	opacity: number;
	targetOpacity: number;
	palette: BackgroundEffectPalette;
};

// Seules les braises flottent dans l'air, devant les blobs ; les autres fonds passent derrière
const FRONT_EFFECTS = new Set([BackgroundEffectEnum.Embers]);
// Durée du fondu enchaîné d'un fond à l'autre
const FADE_SECONDS = 1.2;
const MAX_PIXEL_RATIO = 2;

// Les fonds animés des ambiances, sur deux canvas : derrière la lampe à lave et devant elle.
// En changeant de projet, l'ancien fond s'efface pendant que le nouveau apparaît
export function createBackgroundEffects(
	backCanvas: HTMLCanvasElement,
	frontCanvas: HTMLCanvasElement,
) {
	const contexts = [backCanvas.getContext("2d"), frontCanvas.getContext("2d")];
	const [backContext, frontContext] = contexts;
	let layers: Layer[] = [];
	let width = 0;
	let height = 0;
	let pixelRatio = 1;
	let time = 0;
	let lastFrameAt = performance.now();
	let isEnabled = true;
	let frameId = 0;

	function resize(): void {
		pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		width = backCanvas.clientWidth;
		height = backCanvas.clientHeight;
		for (const canvas of [backCanvas, frontCanvas]) {
			canvas.width = Math.max(1, Math.round(width * pixelRatio));
			canvas.height = Math.max(1, Math.round(height * pixelRatio));
		}
		layers.forEach((layer) => layer.effect.resize?.(width, height));
	}

	function frame(now: number): void {
		frameId = requestAnimationFrame(frame);
		const deltaTime = Math.min(0.05, (now - lastFrameAt) / 1000);
		lastFrameAt = now;
		if (document.hidden) return;
		time += deltaTime;
		for (const context of contexts) {
			context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
			context?.clearRect(0, 0, width, height);
		}
		if (!isEnabled) return;

		const step = deltaTime / FADE_SECONDS;
		for (const layer of layers) {
			layer.opacity =
				layer.targetOpacity > layer.opacity
					? Math.min(layer.targetOpacity, layer.opacity + step)
					: Math.max(layer.targetOpacity, layer.opacity - step);
		}
		// Un fond complètement effacé disparaît
		layers = layers.filter(
			(layer) => layer.targetOpacity > 0 || layer.opacity > 0,
		);
		for (const layer of layers) {
			const context = FRONT_EFFECTS.has(layer.kind)
				? frontContext
				: backContext;
			if (!context) continue;
			context.save();
			context.globalAlpha = layer.opacity;
			layer.effect.draw(context, {
				width,
				height,
				time,
				deltaTime,
				palette: layer.palette,
			});
			context.restore();
		}
	}

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(backCanvas);
	resize();
	frameId = requestAnimationFrame(frame);

	return {
		// Le fond de l'ambiance ; null pour aucun
		setEffect(
			kind: BackgroundEffectEnum | null,
			palette: BackgroundEffectPalette,
		) {
			let isPresent = false;
			for (const layer of layers) {
				if (layer.kind === kind) {
					layer.targetOpacity = 1;
					layer.palette = palette;
					isPresent = true;
				} else {
					layer.targetOpacity = 0;
				}
			}
			if (kind && !isPresent) {
				const effect = backgroundEffectFactories[kind]();
				effect.resize?.(width, height);
				layers.push({ kind, effect, opacity: 0, targetOpacity: 1, palette });
			}
		},
		// Animations réduites : pas de fond animé
		setEnabled(enabled: boolean) {
			isEnabled = enabled;
		},
		destroy() {
			cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
		},
	};
}
