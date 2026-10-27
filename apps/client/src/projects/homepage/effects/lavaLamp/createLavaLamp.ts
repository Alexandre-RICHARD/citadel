import { hexToRgb } from "@citadel/common/src/universal/color/hexToRgb";

import { buildLavaFragmentShader } from "./buildLavaFragmentShader";
import { createLavaBalls } from "./createLavaBalls";
import { lavaVertexShader } from "./lavaVertexShader";

const BALL_COUNT = 8;
// Sur téléphone, moins de blobs, un peu plus petits
const NARROW_BALL_COUNT = 6;
const NARROW_SCALE = 0.85;
// Rendu à demi-résolution : le bord reste net (il suit la pente du champ), et le GPU respire
const RESOLUTION_SCALE = 0.5;
// Sur grand écran, les blobs restent surtout du côté de la présentation, à droite de la roue
const WIDE_MIN_X = 0.36;

type Rgb = [number, number, number];

type PaletteTransition = {
	from: Rgb[];
	to: Rgb[];
	startedAt: number;
	durationMs: number;
};

function toUnitRgb(hex: string): Rgb {
	const [red, green, blue] = hexToRgb(hex);
	return [red / 255, green / 255, blue / 255];
}

function mixRgb(from: Rgb, to: Rgb, ratio: number): Rgb {
	return [
		from[0] + (to[0] - from[0]) * ratio,
		from[1] + (to[1] - from[1]) * ratio,
		from[2] + (to[2] - from[2]) * ratio,
	];
}

// Départ et arrivée en douceur
function easeInOutSine(progress: number): number {
	if (progress <= 0) return 0;
	if (progress >= 1) return 1;
	return 0.5 - 0.5 * Math.cos(Math.PI * progress);
}

function compileShader(
	gl: WebGLRenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, lavaVertexShader);
	const fragmentShader = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		buildLavaFragmentShader(BALL_COUNT),
	);
	const program = gl.createProgram();
	if (!vertexShader || !fragmentShader) return null;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

// Le fond « lampe à lave » : des blobs à bord net qui se déforment et se mêlent lentement, en WebGL.
// Renvoie null sans WebGL : la page affiche alors des halos flous en CSS
export function createLavaLamp(canvas: HTMLCanvasElement) {
	const webglContext = canvas.getContext("webgl", {
		antialias: false,
		alpha: true,
		premultipliedAlpha: true,
	});
	if (!webglContext) return null;
	// Non nul, aussi dans les fonctions plus bas
	const gl = webglContext;
	const program = createProgram(gl);
	if (!program) return null;
	gl.useProgram(program);

	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 3, -1, -1, 3]),
		gl.STATIC_DRAW,
	);
	const positionLocation = gl.getAttribLocation(program, "position");
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	const uniforms = {
		resolution: gl.getUniformLocation(program, "uResolution"),
		balls: gl.getUniformLocation(program, "uBalls"),
		colors: gl.getUniformLocation(program, "uColors"),
		dark: gl.getUniformLocation(program, "uDark"),
	};

	const balls = createLavaBalls(BALL_COUNT);
	const ballData = new Float32Array(BALL_COUNT * 3);
	const colorData = new Float32Array(BALL_COUNT * 3);
	let palette: Rgb[] | null = null;
	let paletteTransition: PaletteTransition | null = null;
	let isDark = true;
	let isNarrow = false;
	let isReduced = false;
	let needsDraw = true;
	let time = 0;
	let lastFrameAt = performance.now();
	let frameId = 0;

	function resize(): void {
		const width = Math.max(
			1,
			Math.round(canvas.clientWidth * RESOLUTION_SCALE),
		);
		const height = Math.max(
			1,
			Math.round(canvas.clientHeight * RESOLUTION_SCALE),
		);
		canvas.setAttribute("width", String(width));
		canvas.setAttribute("height", String(height));
		gl.viewport(0, 0, canvas.width, canvas.height);
		needsDraw = true;
	}

	function draw(now: number): void {
		if (paletteTransition) {
			const { from, to, startedAt, durationMs } = paletteTransition;
			const ratio = easeInOutSine((now - startedAt) / durationMs);
			palette = from.map((color, index) =>
				mixRgb(color, to[index] ?? color, ratio),
			);
			if (ratio >= 1) paletteTransition = null;
		}
		const currentPalette = palette;
		if (!currentPalette) return;

		const aspectRatio = canvas.width / canvas.height;
		const visibleCount = isNarrow ? NARROW_BALL_COUNT : BALL_COUNT;
		const minX = isNarrow ? 0 : WIDE_MIN_X;
		balls.forEach((ball, index) => {
			const x =
				(minX +
					(1 - minX) * ball.baseX +
					ball.driftX * Math.sin(ball.speedX * time + ball.phaseX)) *
				aspectRatio;
			const y =
				0.5 + ball.amplitudeY * Math.sin(ball.speedY * time + ball.phaseY);
			// Un blob masqué garde sa place dans le shader, avec un rayon nul
			const radius =
				index < visibleCount
					? ball.radius *
						(1 + 0.14 * Math.sin(ball.breathSpeed * time + ball.breathPhase)) *
						(isNarrow ? NARROW_SCALE : 1)
					: 0;
			ballData.set([x, y, radius], index * 3);
			colorData.set(currentPalette[ball.colorIndex] ?? [0, 0, 0], index * 3);
		});

		gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
		gl.uniform3fv(uniforms.balls, ballData);
		gl.uniform3fv(uniforms.colors, colorData);
		gl.uniform1f(uniforms.dark, isDark ? 1 : 0);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	function frame(now: number): void {
		frameId = requestAnimationFrame(frame);
		const deltaTime = Math.min(0.05, (now - lastFrameAt) / 1000);
		lastFrameAt = now;
		if (document.hidden) return;
		// Animations réduites : image figée, redessinée seulement quand les couleurs changent
		if (isReduced && !paletteTransition && !needsDraw) return;
		if (!isReduced) time += deltaTime;
		draw(now);
		needsDraw = false;
	}

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(canvas);
	resize();
	frameId = requestAnimationFrame(frame);

	return {
		// Les blobs glissent vers leurs nouvelles couleurs en durationSeconds
		setPalette(colors: string[], durationSeconds: number, dark: boolean) {
			const nextPalette = colors.map(toUnitRgb);
			isDark = dark;
			if (palette) {
				paletteTransition = {
					from: palette,
					to: nextPalette,
					startedAt: performance.now(),
					durationMs: Math.max(durationSeconds, 0.01) * 1000,
				};
			} else {
				palette = nextPalette;
			}
			needsDraw = true;
		},
		setNarrow(narrow: boolean) {
			isNarrow = narrow;
			needsDraw = true;
		},
		setReduced(reduced: boolean) {
			isReduced = reduced;
			needsDraw = true;
		},
		destroy() {
			cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
			// Libère le contexte tout de suite : le navigateur en limite le nombre
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		},
	};
}
