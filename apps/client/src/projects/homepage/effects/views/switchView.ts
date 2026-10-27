import { gsap } from "gsap";

type Options = {
	from: HTMLElement;
	to: HTMLElement;
	// Vers une page du footer, le contenu monte ; vers la présentation, il descend
	isTowardPage: boolean;
	reducedMotion: boolean;
	// Juste après l'échange des deux vues, avant que la nouvelle apparaisse
	onSwap: () => void;
};

// Passe de la présentation des projets à une page du footer, ou l'inverse : l'une s'efface, l'autre apparaît
export function switchView({
	from,
	to,
	isTowardPage,
	reducedMotion,
	onSwap,
}: Options): gsap.core.Timeline {
	const duration = reducedMotion ? 0.15 : 0.3;
	gsap.killTweensOf([from, to]);
	return gsap
		.timeline()
		.to(from, {
			opacity: 0,
			y: isTowardPage ? -10 : 10,
			duration,
			ease: "power1.in",
		})
		.add(() => {
			from.toggleAttribute("hidden", true);
			to.toggleAttribute("hidden", false);
			onSwap();
		})
		.fromTo(
			to,
			{ opacity: 0, y: isTowardPage ? 16 : -16 },
			{ opacity: 1, y: 0, duration: duration * 1.7, ease: "power3.out" },
		);
}
