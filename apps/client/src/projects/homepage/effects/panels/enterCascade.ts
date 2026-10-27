import { gsap } from "gsap";

// La présentation entre en cascade (les éléments data-anim, dans l'ordre) : chacun glisse depuis la gauche,
// le titre se dévoile comme un rideau, l'illustration se pose avec un rebond
export function enterCascade(
	panel: HTMLElement,
	reducedMotion: boolean,
): gsap.core.Timeline {
	const blocks = panel.querySelectorAll("[data-anim]");
	const timeline = gsap.timeline();

	if (reducedMotion) {
		timeline.to(blocks, { opacity: 1, duration: 0.3 });
		return timeline;
	}

	timeline.fromTo(
		blocks,
		{ x: -36, opacity: 0 },
		{ x: 0, opacity: 1, duration: 0.95, ease: "power3.out", stagger: 0.09 },
		0,
	);
	const title = panel.querySelector("[data-anim-title]");
	if (title)
		timeline.fromTo(
			title,
			{ clipPath: "inset(-20% 100% -20% 0%)" },
			{
				clipPath: "inset(-20% -10% -20% 0%)",
				duration: 1.1,
				ease: "power3.inOut",
			},
			0,
		);
	const illustration = panel.querySelector("[data-anim-illustration]");
	if (illustration)
		timeline.fromTo(
			illustration,
			{ scale: 0.8, rotation: -8 },
			{ scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)" },
			0,
		);
	return timeline;
}
