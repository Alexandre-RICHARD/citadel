import { gsap } from "gsap";

import { logoBars } from "../../components/Logo/logoBars";

// Jusqu'où les barres s'écartent du centre, en unités du viewBox (le côté de l'hexagone en fait 7)
const DRIFT = 1.9;

// Au survol, les six barres se détachent, s'écartent du centre, glissent chacune à la place de sa voisine de
// droite puis s'y raccrochent ; le A se tasse pendant le tour et rebondit à leur retour. Les barres étant
// identiques, la fin du tour ressemble à son début : il recommence tant que le survol dure, et va au bout quand
// il s'arrête. Renvoie de quoi tout retirer
export function orbitLogoOnHover(logo: SVGSVGElement): () => void {
	const orbits = logo.querySelectorAll("[data-logo-orbit]");
	const drifts = logo.querySelectorAll("[data-logo-drift]");
	const letter = logo.querySelector("[data-logo-letter]");
	let isHovered = false;

	gsap.set(letter, { transformOrigin: "50% 50%" });

	const timeline = gsap
		.timeline({
			paused: true,
			onComplete() {
				// Les barres à 60° ou à 0° ont la même allure : on repart de 0 sans que ça se voie
				if (isHovered) timeline.restart();
				else timeline.pause(0);
			},
		})
		// Elles se détachent l'une après l'autre, en vague autour de l'hexagone
		.to(
			drifts,
			{
				x: (index: number) => logoBars[index].outward.x * DRIFT,
				y: (index: number) => logoBars[index].outward.y * DRIFT,
				duration: 0.45,
				ease: "power2.out",
				stagger: 0.04,
			},
			0,
		)
		.to(letter, { scale: 0.82, duration: 0.5, ease: "power2.inOut" }, 0)
		.to(
			orbits,
			{
				rotation: 60,
				svgOrigin: "0 0",
				duration: 1.2,
				ease: "power2.inOut",
			},
			0.2,
		)
		// Et se raccrochent ensemble, en douceur, quand le tour ralentit
		.to(drifts, { x: 0, y: 0, duration: 0.55, ease: "power3.inOut" }, 1.05)
		.to(
			letter,
			{
				keyframes: [
					{ scale: 1.12, duration: 0.18, ease: "power2.out" },
					{ scale: 0.96, duration: 0.14, ease: "sine.inOut" },
					{ scale: 1, duration: 0.2, ease: "sine.out" },
				],
			},
			1.45,
		);

	function handlePointerEnter(): void {
		isHovered = true;
		if (!timeline.isActive()) timeline.restart();
	}
	function handlePointerLeave(): void {
		isHovered = false;
	}

	logo.addEventListener("pointerenter", handlePointerEnter);
	logo.addEventListener("pointerleave", handlePointerLeave);

	return () => {
		logo.removeEventListener("pointerenter", handlePointerEnter);
		logo.removeEventListener("pointerleave", handlePointerLeave);
		timeline.kill();
		gsap.set([...orbits, ...drifts], { clearProps: "transform" });
		if (letter) gsap.set(letter, { clearProps: "transform" });
	};
}
