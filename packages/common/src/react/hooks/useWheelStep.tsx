import { type RefObject, useEffect, useRef } from "react";

import { accumulateWheel } from "../../browser/dom/accumulateWheel.ts";

/**
 * La molette au-dessus de l'élément avance d'un pas (1 : vers le bas) ou recule (-1 : vers le haut), sans faire
 * défiler la page dessous. Écouteur non passif : un écouteur React ne peut pas annuler le défilement.
 * `shouldHandle` répond faux : la molette reste au navigateur (la page défile), comme sur un champ sans focus
 */
export function useWheelStep(
	elementRef: RefObject<HTMLElement | null>,
	onStep: (step: -1 | 1) => void,
	shouldHandle?: () => boolean,
): void {
	const onStepRef = useRef(onStep);
	const shouldHandleRef = useRef(shouldHandle);

	useEffect(() => {
		onStepRef.current = onStep;
		shouldHandleRef.current = shouldHandle;
	});

	useEffect(() => {
		const element = elementRef.current;
		if (element === null) return undefined;
		let accumulated = 0;
		function handleWheel(event: WheelEvent) {
			if (shouldHandleRef.current?.() === false) return;
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
