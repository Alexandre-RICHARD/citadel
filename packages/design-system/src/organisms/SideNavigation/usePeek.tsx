import {
	type FocusEvent,
	type MouseEvent,
	type PointerEvent,
	useEffect,
	useRef,
	useState,
} from "react";

/**
 * Le menu réduit s'ouvre par-dessus la page le temps d'un survol à la souris ou d'une visite au clavier. Au doigt, le
 * premier appui l'ouvre sans suivre le lien touché, le suivant navigue ; un appui hors du menu ou Échap le referme
 */
export function usePeek(isEnabled: boolean) {
	const [isPeeking, setIsPeeking] = useState(false);
	const panelRef = useRef<HTMLElement>(null);
	const lastPointerTypeRef = useRef("mouse");
	const isShown = isEnabled && isPeeking;

	useEffect(() => {
		if (!isShown) return undefined;

		function closeFromOutside(event: globalThis.PointerEvent): void {
			if (
				event.target instanceof Node &&
				panelRef.current?.contains(event.target)
			)
				return;
			setIsPeeking(false);
		}
		function closeOnEscape(event: KeyboardEvent): void {
			if (event.key === "Escape") setIsPeeking(false);
		}

		document.addEventListener("pointerdown", closeFromOutside);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeFromOutside);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isShown]);

	function peekWithMouse(event: PointerEvent, isEntering: boolean): void {
		if (isEnabled && event.pointerType === "mouse") setIsPeeking(isEntering);
	}

	return {
		isPeeking: isShown,
		closePeek: () => setIsPeeking(false),
		panelRef,
		onPointerEnter: (event: PointerEvent) => peekWithMouse(event, true),
		onPointerLeave: (event: PointerEvent) => peekWithMouse(event, false),
		onPointerDown: (event: PointerEvent) => {
			lastPointerTypeRef.current = event.pointerType;
		},
		onClickCapture: (event: MouseEvent) => {
			if (!isEnabled || isShown || lastPointerTypeRef.current === "mouse")
				return;
			event.preventDefault();
			event.stopPropagation();
			setIsPeeking(true);
		},
		onFocus: (event: FocusEvent) => {
			if (isEnabled && event.target.matches(":focus-visible"))
				setIsPeeking(true);
		},
		onBlur: (event: FocusEvent) => {
			if (
				event.relatedTarget instanceof Node &&
				event.currentTarget.contains(event.relatedTarget)
			)
				return;
			setIsPeeking(false);
		},
	};
}
