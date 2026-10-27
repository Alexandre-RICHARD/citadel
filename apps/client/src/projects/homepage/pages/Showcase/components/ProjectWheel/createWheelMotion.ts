import { clamp } from "@citadel/common/src/universal/number/clamp";

import { buildWheelArcPaths } from "./buildWheelArcPaths";
import { computeWheelGeometry } from "./computeWheelGeometry";
import { getWheelItemPlacement } from "./getWheelItemPlacement";
import { rubberBand } from "./rubberBand";
import type { WheelGeometry } from "./wheelGeometry.type";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

type Options = {
	// La roue : sa taille, et les gestes qui la font tourner
	root: HTMLElement;
	arcLine: SVGPathElement;
	minorTicks: SVGPathElement;
	majorTicks: SVGPathElement;
	clearButton: HTMLElement;
};

type Drag = {
	pointerId: number;
	startX: number;
	startY: number;
	startTarget: number;
	hasMoved: boolean;
	// Les dernières positions et leur instant, pour l'élan au lâcher
	samples: [number, number][];
};

// Un geste plus court n'est pas un glisser : c'est un clic
const DRAG_THRESHOLD = 6;
// Molette : pixels de défilement pour passer d'une boîte à la suivante
const WHEEL_PIXELS_PER_ITEM = 170;
// La molette peut pousser un peu au-delà des butées, puis la roue revient
const WHEEL_OVERSHOOT = 0.35;
const SNAP_DELAY_MS = 170;
// Vitesse de rattrapage de la position affichée vers la cible
const FOLLOW_SPEED = 10;
const MOMENTUM = 0.18;
const SETTLED = 0.0005;

// Fait tourner la roue des projets : molette, doigt ou souris, avec des butées en haut et en bas.
// Tourner ne sélectionne rien ; la roue suit la sélection et le focus clavier. Les boîtes sont rendues par React,
// leur position est posée ici, à chaque image
export function createWheelMotion({
	root,
	arcLine,
	minorTicks,
	majorTicks,
	clearButton,
}: Options) {
	let items: HTMLElement[] = [];
	// position : l'index (fractionnaire) de la boîte au centre ; target : où la roue va
	let position = 0;
	let target = 0;
	let orientation = WheelOrientationEnum.Vertical;
	let isReduced = false;
	let geometry: WheelGeometry | null = null;
	let needsRender = true;
	let drag: Drag | null = null;
	let snapTimeout: ReturnType<typeof setTimeout> | undefined;
	let shouldIgnoreClick = false;
	let lastFrameAt = performance.now();
	let frameId = 0;
	const listeners = new AbortController();

	function getMaxIndex(): number {
		return Math.max(0, items.length - 1);
	}

	function snapSoon(): void {
		clearTimeout(snapTimeout);
		snapTimeout = setTimeout(() => {
			target = clamp(Math.round(target), 0, getMaxIndex());
		}, SNAP_DELAY_MS);
	}

	function relayout(): void {
		geometry = computeWheelGeometry(
			root.clientWidth,
			root.clientHeight,
			orientation,
		);
		if (geometry) {
			clearButton.style.setProperty("left", `${geometry.clearButtonX}px`);
			clearButton.style.setProperty("top", `${geometry.clearButtonY}px`);
		}
		needsRender = true;
	}

	function render(currentGeometry: WheelGeometry): void {
		for (const [index, { style }] of items.entries()) {
			const placement = getWheelItemPlacement(
				index - position,
				currentGeometry,
			);
			style.visibility = placement.isVisible ? "" : "hidden";
			if (!placement.isVisible) continue;
			style.transform = placement.transform;
			style.opacity = String(placement.opacity);
			style.zIndex = String(placement.zIndex);
		}
		const paths = buildWheelArcPaths(currentGeometry, position, items.length);
		arcLine.setAttribute("d", paths.line);
		minorTicks.setAttribute("d", paths.minorTicks);
		majorTicks.setAttribute("d", paths.majorTicks);
	}

	function frame(now: number): void {
		frameId = requestAnimationFrame(frame);
		const deltaTime = Math.min(0.05, (now - lastFrameAt) / 1000);
		lastFrameAt = now;
		if (!geometry) relayout();
		if (!geometry) return;

		const gap = target - position;
		if (Math.abs(gap) < SETTLED && !needsRender) return;
		position = isReduced
			? target
			: position + gap * (1 - Math.exp(-deltaTime * FOLLOW_SPEED));
		if (Math.abs(target - position) < SETTLED) position = target;
		render(geometry);
		needsRender = false;
	}

	function handleWheel(event: WheelEvent): void {
		event.preventDefault();
		const isAlongWheel =
			orientation === WheelOrientationEnum.Vertical ||
			Math.abs(event.deltaY) > Math.abs(event.deltaX);
		let delta = isAlongWheel ? event.deltaY : event.deltaX;
		// Défilement par lignes (certaines souris) : environ 16 pixels la ligne
		if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
		target = clamp(
			target + delta / WHEEL_PIXELS_PER_ITEM,
			-WHEEL_OVERSHOOT,
			getMaxIndex() + WHEEL_OVERSHOOT,
		);
		snapSoon();
	}

	function handlePointerDown(event: PointerEvent): void {
		if (
			event.button !== 0 ||
			(event.target instanceof Node && clearButton.contains(event.target))
		)
			return;
		drag = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			startTarget: target,
			hasMoved: false,
			samples: [[performance.now(), target]],
		};
	}

	function handlePointerMove(event: PointerEvent): void {
		if (drag?.pointerId !== event.pointerId || !geometry) return;
		const distance =
			orientation === WheelOrientationEnum.Vertical
				? event.clientY - drag.startY
				: event.clientX - drag.startX;
		if (!drag.hasMoved && Math.abs(distance) > DRAG_THRESHOLD)
			drag.hasMoved = true;
		if (!drag.hasMoved) return;
		target = rubberBand(
			drag.startTarget - distance / geometry.spacing,
			getMaxIndex(),
		);
		drag.samples.push([performance.now(), target]);
		if (drag.samples.length > 6) drag.samples.shift();
	}

	function handlePointerUp(event: PointerEvent): void {
		if (drag?.pointerId !== event.pointerId) return;
		const { hasMoved, samples } = drag;
		drag = null;
		if (!hasMoved) return;
		// Le clic qui suit un glisser ne sélectionne rien
		shouldIgnoreClick = true;
		setTimeout(() => {
			shouldIgnoreClick = false;
		}, 0);
		// Un peu d'élan, puis la roue se cale sur une boîte
		const [firstAt, firstTarget] = samples[0];
		const [lastAt, lastTarget] = samples[samples.length - 1];
		const velocity =
			lastAt > firstAt
				? (lastTarget - firstTarget) / ((lastAt - firstAt) / 1000)
				: 0;
		target = clamp(Math.round(target + velocity * MOMENTUM), 0, getMaxIndex());
	}

	const { signal } = listeners;
	root.addEventListener("wheel", handleWheel, { passive: false, signal });
	root.addEventListener("pointerdown", handlePointerDown, { signal });
	window.addEventListener("pointermove", handlePointerMove, { signal });
	window.addEventListener("pointerup", handlePointerUp, { signal });
	window.addEventListener("pointercancel", handlePointerUp, { signal });
	// Vue réaffichée, fenêtre redimensionnée : la roue se recale
	const resizeObserver = new ResizeObserver(relayout);
	resizeObserver.observe(root);
	frameId = requestAnimationFrame(frame);

	return {
		// Les boîtes, dans l'ordre ; sans sélection, la roue se centre sur la liste
		setItems(elements: HTMLElement[], selectedIndex: number | null) {
			items = elements;
			target = selectedIndex ?? Math.floor(getMaxIndex() / 2);
			position = target;
			needsRender = true;
		},
		// La boîte sélectionnée vient au centre ; désélectionner laisse la roue où elle est
		setSelectedIndex(index: number | null) {
			if (index !== null) target = index;
			needsRender = true;
		},
		// La roue suit le focus clavier
		focusIndex(index: number) {
			if (!drag) target = index;
		},
		setOrientation(nextOrientation: WheelOrientationEnum) {
			orientation = nextOrientation;
			relayout();
		},
		setReducedMotion(reduced: boolean) {
			isReduced = reduced;
		},
		// Vrai si le clic termine un glisser : il ne doit pas sélectionner
		isDragClick(): boolean {
			return shouldIgnoreClick;
		},
		destroy() {
			cancelAnimationFrame(frameId);
			clearTimeout(snapTimeout);
			listeners.abort();
			resizeObserver.disconnect();
		},
	};
}
