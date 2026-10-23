import { type RefObject, useLayoutEffect } from "react";

import type { PopoverPlacement } from "./popoverPlacement.type";

/** Marge gardée entre un panneau et les bords de la fenêtre */
const viewportMargin = 8;

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
}

/** Position fixe du panneau : du côté demandé s'il y tient, sinon de l'autre, puis ramené dans la fenêtre */
function computePosition(
	anchor: DOMRect,
	panel: DOMRect,
	placement: PopoverPlacement,
	offset: number,
): { top: number; left: number } {
	const viewportWidth = document.documentElement.clientWidth;
	const viewportHeight = document.documentElement.clientHeight;
	const [side, align] = placement.split("-");
	let top: number;
	let left: number;

	if (side === "top" || side === "bottom") {
		const below = anchor.bottom + offset;
		const above = anchor.top - offset - panel.height;
		const fitsBelow = below + panel.height <= viewportHeight - viewportMargin;
		const fitsAbove = above >= viewportMargin;
		if (side === "bottom") {
			top = fitsBelow || !fitsAbove ? below : above;
		} else {
			top = fitsAbove || !fitsBelow ? above : below;
		}
		if (align === "start") {
			left = anchor.left;
		} else if (align === "end") {
			left = anchor.right - panel.width;
		} else {
			left = anchor.left + (anchor.width - panel.width) / 2;
		}
	} else {
		const after = anchor.right + offset;
		const before = anchor.left - offset - panel.width;
		const fitsAfter = after + panel.width <= viewportWidth - viewportMargin;
		const fitsBefore = before >= viewportMargin;
		if (side === "right") {
			left = fitsAfter || !fitsBefore ? after : before;
		} else {
			left = fitsBefore || !fitsAfter ? before : after;
		}
		top = anchor.top + (anchor.height - panel.height) / 2;
	}

	return {
		top: clamp(
			top,
			viewportMargin,
			viewportHeight - viewportMargin - panel.height,
		),
		left: clamp(
			left,
			viewportMargin,
			viewportWidth - viewportMargin - panel.width,
		),
	};
}

/**
 * Place un panneau flottant (en `position: fixed`) contre son ancre, et le suit au défilement, au redimensionnement
 * de la fenêtre et quand l'un des deux change de taille. Le style est posé directement sur le panneau : pas de rendu.
 */
export function usePopover({
	anchorRef,
	panelRef,
	placement,
	offset,
	matchAnchorWidth,
}: {
	anchorRef: RefObject<HTMLElement | null>;
	panelRef: RefObject<HTMLElement | null>;
	placement: PopoverPlacement;
	offset: number;
	matchAnchorWidth: boolean;
}): void {
	useLayoutEffect(() => {
		const anchor = anchorRef.current;
		const panel = panelRef.current;
		if (anchor === null || panel === null) {
			return undefined;
		}
		let frame = 0;

		function update() {
			// L'ancre est relue à chaque calcul : si elle a été remplacée dans la page, le panneau suit la nouvelle
			const currentAnchor = anchorRef.current;
			if (currentAnchor === null || panel === null) {
				return;
			}
			const anchorRect = currentAnchor.getBoundingClientRect();
			if (matchAnchorWidth) {
				panel.style.minWidth = `${anchorRect.width}px`;
			}
			const { top, left } = computePosition(
				anchorRect,
				panel.getBoundingClientRect(),
				placement,
				offset,
			);
			panel.style.top = `${top}px`;
			panel.style.left = `${left}px`;
		}

		function scheduleUpdate() {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(update);
		}

		update();
		const resizeObserver = new ResizeObserver(scheduleUpdate);
		resizeObserver.observe(anchor);
		resizeObserver.observe(panel);
		// Le défilement d'un conteneur ne remonte pas : on l'écoute à la capture
		window.addEventListener("scroll", scheduleUpdate, {
			capture: true,
			passive: true,
		});
		window.addEventListener("resize", scheduleUpdate);
		return () => {
			window.cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			window.removeEventListener("scroll", scheduleUpdate, { capture: true });
			window.removeEventListener("resize", scheduleUpdate);
		};
	}, [anchorRef, panelRef, placement, offset, matchAnchorWidth]);
}
