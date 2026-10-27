import { gsap } from "gsap";

type Options = {
	introLogo: SVGSVGElement;
	background: HTMLElement;
	headerLogo: SVGSVGElement;
	// Le Layout : ses éléments data-reveal apparaissent quand le logo rejoint le header
	scope: HTMLElement;
	onReveal: () => void;
	onDone: () => void;
};

type Flight = {
	x: number;
	y: number;
	scale: number;
};

// Comment chaque partie de la page apparaît après l'intro (data-reveal)
const REVEALS: Partial<Record<string, [gsap.TweenVars, gsap.TweenVars]>> = {
	brand: [
		{ opacity: 0, x: -10 },
		{ opacity: 1, x: 0, duration: 0.6, ease: "power3.out" },
	],
	actions: [
		{ opacity: 0, y: -10 },
		{ opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: "power3.out" },
	],
	wheel: [
		{ opacity: 0, x: -30 },
		{ opacity: 1, x: 0, duration: 0.9, ease: "power3.out" },
	],
	present: [{ opacity: 0 }, { opacity: 1, duration: 0.4 }],
	footer: [{ opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3 }],
};

// Touches qui ne passent pas l'intro : elles servent déjà (navigation au clavier, outils du navigateur)
const IGNORED_KEYS = new Set([
	"Tab",
	"Shift",
	"Control",
	"Alt",
	"Meta",
	"CapsLock",
	"F5",
	"F11",
	"F12",
]);

// Le logo se dessine barre après barre, le A apparaît avec un rebond, puis le logo rejoint sa place dans le header
// pendant que la page apparaît. Une touche ou un clic accélère jusqu'à la fin. Renvoie de quoi tout arrêter
export function playIntro({
	introLogo,
	background,
	headerLogo,
	scope,
	onReveal,
	onDone,
}: Options): () => void {
	const revealTargets = Array.from(
		scope.querySelectorAll<HTMLElement>("[data-reveal]"),
	);
	const bars = introLogo.querySelectorAll("[data-logo-bar]");
	const letter = introLogo.querySelector("[data-logo-letter]");

	headerLogo.style.setProperty("visibility", "hidden");
	gsap.set(revealTargets, { opacity: 0 });
	gsap.set(bars, { scaleX: 0, transformOrigin: "0% 50%" });
	gsap.set(letter, { scale: 0, transformOrigin: "50% 50%" });

	// Mesuré au moment de l'envol : la page a fini de se mettre en place
	let flight: Flight | null = null;
	function measureFlight(): Flight {
		if (flight) return flight;
		const from = introLogo.getBoundingClientRect();
		const to = headerLogo.getBoundingClientRect();
		flight = {
			x: to.left + to.width / 2 - (from.left + from.width / 2),
			y: to.top + to.height / 2 - (from.top + from.height / 2),
			scale: to.width / from.width,
		};
		return flight;
	}

	function reveal(): void {
		revealTargets.forEach((target) => {
			const [from, to] = REVEALS[target.dataset.reveal ?? ""] ?? [
				{ opacity: 0 },
				{ opacity: 1, duration: 0.4 },
			];
			gsap.fromTo(target, from, to);
		});
		onReveal();
	}

	// Les écouteurs qui passent l'intro, retirés d'un coup
	const skipListeners = new AbortController();

	const timeline = gsap
		.timeline()
		.to(bars, { scaleX: 1, duration: 0.26, ease: "power1.in", stagger: 0.17 })
		.to(letter, { scale: 1, duration: 0.24, ease: "power2.out" }, 1.19)
		// Le A tremble comme une gelée avant de se poser
		.to(letter, {
			keyframes: [
				{ scaleX: 0.75, scaleY: 1.25, duration: 0.16 },
				{ scaleX: 1.25, scaleY: 0.75, duration: 0.06 },
				{ scaleX: 0.85, scaleY: 1.15, duration: 0.06 },
				{ scaleX: 1.05, scaleY: 0.95, duration: 0.08 },
				{ scaleX: 0.95, scaleY: 1.05, duration: 0.07 },
				{ scaleX: 1, scaleY: 1, duration: 0.13 },
			],
		})
		.addLabel("fly", "+=0.2")
		.to(
			introLogo,
			{
				x: () => measureFlight().x,
				y: () => measureFlight().y,
				scale: () => measureFlight().scale,
				duration: 0.65,
				ease: "power3.inOut",
			},
			"fly",
		)
		.to(
			background,
			{ opacity: 0, duration: 0.55, ease: "power1.inOut" },
			"fly+=0.1",
		)
		.add(reveal, "fly+=0.3")
		.add(() => {
			headerLogo.style.removeProperty("visibility");
			skipListeners.abort();
			onDone();
		}, "fly+=0.65");

	// Passer l'intro : on saute à l'envol, puis tout va plus vite
	function skip(event: KeyboardEvent | PointerEvent): void {
		if (
			event instanceof KeyboardEvent &&
			(event.ctrlKey ||
				event.metaKey ||
				event.altKey ||
				IGNORED_KEYS.has(event.key))
		)
			return;
		const flyAt = timeline.labels.fly ?? 0;
		if (timeline.time() < flyAt) timeline.seek(flyAt);
		timeline.timeScale(1.6);
		skipListeners.abort();
	}
	window.addEventListener("keydown", skip, {
		capture: true,
		signal: skipListeners.signal,
	});
	window.addEventListener("pointerdown", skip, {
		capture: true,
		signal: skipListeners.signal,
	});

	return () => {
		timeline.kill();
		skipListeners.abort();
		headerLogo.style.removeProperty("visibility");
		gsap.set(revealTargets, { clearProps: "opacity,transform" });
	};
}
