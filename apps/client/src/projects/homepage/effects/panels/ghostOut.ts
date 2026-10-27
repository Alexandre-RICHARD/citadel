import { gsap } from "gsap";

type Options = {
	// Une sortie déjà en cours : celle-ci va plus vite, pour ne pas faire attendre la présentation suivante
	isFast: boolean;
	reducedMotion: boolean;
};

const FROZEN_VARIABLES = [
	"--ambiance-fontDisplay",
	"--ambiance-fontBody",
	"--ambiance-textTransform",
];

// Le texte en place sort façon fantôme, bloc par bloc (les éléments data-anim) : chacun ondule, descend en se
// balançant comme une feuille qui tombe, se floute et s'efface
export function ghostOut(
	panel: HTMLElement,
	{ isFast, reducedMotion }: Options,
): gsap.core.Timeline {
	// Le fantôme garde les polices de l'ambiance qu'il quitte
	const computedStyle = getComputedStyle(panel);
	FROZEN_VARIABLES.forEach((name) =>
		panel.style.setProperty(name, computedStyle.getPropertyValue(name)),
	);

	const blocks = Array.from(panel.querySelectorAll<HTMLElement>("[data-anim]"));
	gsap.killTweensOf(blocks);
	gsap.set(blocks, { clearProps: "clipPath" });
	const timeline = gsap.timeline();

	if (reducedMotion) {
		timeline.to(blocks, { opacity: 0, duration: 0.25 });
		return timeline;
	}

	blocks.forEach((block, index) => {
		const duration = 1.2 + Math.random() * 0.6;
		const startAt = index * 0.08 + Math.random() * 0.06;
		const direction = Math.random() < 0.5 ? -1 : 1;
		const sway = 10 + Math.random() * 14;
		timeline.to(
			block,
			{
				y: `+=${60 + Math.random() * 70}`,
				opacity: 0,
				duration,
				ease: "sine.in",
			},
			startAt,
		);
		// Le balancement de la feuille : de moins en moins ample
		timeline.to(
			block,
			{
				keyframes: {
					x: [
						0,
						direction * sway,
						-direction * sway * 0.7,
						direction * sway * 0.45,
					],
					rotation: [0, direction * 5, -direction * 3.5, direction * 2],
					easeEach: "sine.inOut",
				},
				duration,
				ease: "none",
			},
			startAt,
		);
		timeline.to(
			block,
			{ filter: "blur(2.5px)", duration: duration * 0.7, ease: "power1.in" },
			startAt + duration * 0.3,
		);
	});

	if (isFast) timeline.timeScale(2.2);
	return timeline;
}
