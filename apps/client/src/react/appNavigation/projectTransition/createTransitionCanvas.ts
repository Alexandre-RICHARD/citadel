import { clamp } from "@citadel/common/src/universal/number/clamp";

import type { TransitionPainter } from "./painters/transitionPainter.type";
import { transitionPainters } from "./painters/transitionPainters";
import type { TransitionEffectEnum } from "./transitionEffect.enum";
import type { TransitionPalette } from "./transitionPalette.type";
import { TransitionPhaseEnum } from "./transitionPhase.enum";
import type { TransitionPoint } from "./transitionPoint.type";

const COVER_MS = 700;
const REVEAL_MS = 750;
// Au-delà, une image de plus ne se voit pas, et le canvas pèserait lourd sur un écran très dense
const MAX_PIXEL_RATIO = 2;

type PhaseAnimation = {
	startedAt: number;
	durationMs: number;
	resolve: () => void;
};

// Le canvas plein écran des transitions. Il dessine en continu tant qu'une transition est en cours,
// y compris pendant que le projet se charge sous l'écran couvert (les braises continuent de monter)
export function createTransitionCanvas(canvas: HTMLCanvasElement) {
	const context = canvas.getContext("2d");
	let width = 0;
	let height = 0;
	let pixelRatio = 1;
	let painter: TransitionPainter | null = null;
	let phase = TransitionPhaseEnum.Cover;
	let progress = 0;
	let animation: PhaseAnimation | null = null;
	let frameId: number | null = null;
	let time = 0;
	let lastFrameAt = 0;

	function resize(): void {
		pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.setAttribute(
			"width",
			String(Math.max(1, Math.round(width * pixelRatio))),
		);
		canvas.setAttribute(
			"height",
			String(Math.max(1, Math.round(height * pixelRatio))),
		);
	}

	function drawFrame(now: number): void {
		frameId = requestAnimationFrame(drawFrame);
		const deltaTime = Math.min(0.05, (now - lastFrameAt) / 1000);
		lastFrameAt = now;
		time += deltaTime;

		if (animation) {
			progress = clamp(
				(now - animation.startedAt) / animation.durationMs,
				0,
				1,
			);
			if (progress >= 1) {
				const { resolve } = animation;
				animation = null;
				resolve();
			}
		}

		if (!context || !painter) return;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.clearRect(0, 0, width, height);
		painter.draw(context, { phase, progress, time, deltaTime });
	}

	function animatePhase(nextPhase: TransitionPhaseEnum, durationMs: number) {
		phase = nextPhase;
		progress = 0;
		return new Promise<void>((resolve) => {
			animation = { startedAt: performance.now(), durationMs, resolve };
		});
	}

	function stop(): void {
		if (frameId !== null) cancelAnimationFrame(frameId);
		frameId = null;
		painter = null;
		context?.setTransform(1, 0, 0, 1, 0, 0);
		context?.clearRect(0, 0, canvas.width, canvas.height);
		canvas.toggleAttribute("hidden", true);
	}

	// L'écran se couvre dans le style du projet, depuis origin (le bouton cliqué)
	function cover(
		effect: TransitionEffectEnum,
		palette: TransitionPalette,
		isDark: boolean,
		origin: TransitionPoint,
	): Promise<void> {
		canvas.toggleAttribute("hidden", false);
		resize();
		painter = transitionPainters[effect]({
			width,
			height,
			palette,
			origin,
			isDark,
		});
		if (frameId === null) {
			time = 0;
			lastFrameAt = performance.now();
			frameId = requestAnimationFrame(drawFrame);
		}
		return animatePhase(TransitionPhaseEnum.Cover, COVER_MS);
	}

	// Puis se découvre sur la nouvelle page, et le canvas disparaît
	async function reveal(): Promise<void> {
		await animatePhase(TransitionPhaseEnum.Reveal, REVEAL_MS);
		stop();
	}

	// Fonctions et non méthodes : elles se passent telles quelles au store des transitions
	return { cover, reveal, destroy: stop };
}
