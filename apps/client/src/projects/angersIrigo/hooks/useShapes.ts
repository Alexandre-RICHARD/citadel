import { useEffect, useState } from "react";

import { loadShapes } from "../data/shapes";
import type { TripShape } from "../types/shape";

/** Tracés des courses ; undefined tant qu'ils ne sont pas chargés (ou si le chargement échoue) */
export function useShapes(): ReadonlyMap<string, TripShape> | undefined {
	const [shapes, setShapes] = useState<ReadonlyMap<string, TripShape>>();

	useEffect(() => {
		let isMounted = true;
		loadShapes()
			.then((loadedShapes) => isMounted && setShapes(loadedShapes))
			.catch((error: unknown) =>
				console.error("Impossible de charger les tracés :", error),
			);
		return () => {
			isMounted = false;
		};
	}, []);

	return shapes;
}
