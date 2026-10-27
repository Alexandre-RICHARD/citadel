import { type RefObject, useEffect } from "react";

import { orbitLogoOnHover } from "../effects/logo/orbitLogoOnHover";

// Le logo du header tourne sur lui-même au survol, sauf si l'on préfère moins d'animations
export function useLogoOrbit(
	logoRef: RefObject<SVGSVGElement | null>,
	reducedMotion: boolean,
): void {
	useEffect(() => {
		const logo = logoRef.current;
		if (!logo || reducedMotion) return undefined;
		return orbitLogoOnHover(logo);
	}, [logoRef, reducedMotion]);
}
