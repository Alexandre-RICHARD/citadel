import { type RefObject, useEffect, useState } from "react";

// Même seuil que le mixin phone de variables.scss : en dessous, la roue passe en haut, en arc horizontal
const NARROW_MAX_WIDTH = 720;

// L'élément est étroit (téléphone) : suit sa largeur, pas celle de la fenêtre
export function useIsNarrow(
	elementRef: RefObject<HTMLElement | null>,
): boolean {
	const [isNarrow, setIsNarrow] = useState(
		() => window.innerWidth <= NARROW_MAX_WIDTH,
	);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return undefined;
		const observer = new ResizeObserver(([entry]) => {
			if (entry) setIsNarrow(entry.contentRect.width <= NARROW_MAX_WIDTH);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [elementRef]);

	return isNarrow;
}
