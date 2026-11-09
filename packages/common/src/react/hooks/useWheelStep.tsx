import { type RefObject, useEffect, useRef } from "react";

import { accumulateWheel } from "../../browser/dom/accumulateWheel.ts";

/**
 * La molette au-dessus de l'élément avance d'un pas (1 : vers le bas) ou recule (-1 : vers le haut), sans faire
 * défiler la page dessous. Écouteur non passif : un écouteur React ne peut pas annuler le défilement
 */
export function useWheelStep(
	elementRef: RefObject<HTMLElement | null>,
	onStep: (step: -1 | 1) => void,
): void {
	const onStepRef = useRef(onStep);

	useEffect(() => {
		onStepRef.current = onStep;
	});

	useEffect(() => {
		const element = elementRef.current;
		if (element === null) return undefined;
		let accumulated = 0;
		function handleWheel(event: WheelEvent) {
			event.preventDefault();
			const result = accumulateWheel(
				accumulated,
				event.deltaY,
				event.deltaMode,
			);
			accumulated = result.accumulated;
			if (result.step !== 0) onStepRef.current(result.step);
		}
		element.addEventListener("wheel", handleWheel, { passive: false });
		return () => element.removeEventListener("wheel", handleWheel);
	}, [elementRef]);
}
