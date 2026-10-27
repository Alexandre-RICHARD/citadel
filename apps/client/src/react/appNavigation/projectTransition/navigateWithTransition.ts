import { projectTransitionStore } from "./projectTransitionStore";
import type { TransitionEffectEnum } from "./transitionEffect.enum";
import type { TransitionPalette } from "./transitionPalette.type";
import type { TransitionPoint } from "./transitionPoint.type";
import type { TransitionTip } from "./transitionTip.type";
import { wait } from "./wait";
import { waitForNextPaint } from "./waitForNextPaint";

// Au-delà de ce délai après que l'écran est couvert, le chargement traîne : l'astuce s'affiche,
// et reste le temps d'être lue
const TIP_AFTER_MS = 300;
const TIP_MIN_MS = 1400;
// La page qui arrive prévient qu'elle est affichée ; sans nouvelles, l'écran se découvre quand même
const PAGE_READY_TIMEOUT_MS = 2000;

type Options = {
	// Change de page : la navigation que le routeur a retenue le temps que l'écran se couvre
	navigate: () => void;
	effect: TransitionEffectEnum;
	palette: TransitionPalette;
	isDark: boolean;
	origin: TransitionPoint;
	// Lance le chargement de la page de destination : il part dès le clic, pendant que l'écran se couvre
	load: () => Promise<unknown>;
	tip: TransitionTip | null;
	// Animations réduites : pas de rideau, la page s'affiche une fois chargée
	reducedMotion: boolean;
};

// L'écran se couvre, la page de destination s'affiche dessous, puis l'écran se découvre sur la page déjà prête.
// En 1,5 s environ ; plus long seulement si le chargement traîne, avec une astuce
export async function navigateWithTransition({
	navigate,
	effect,
	palette,
	isDark,
	origin,
	load,
	tip,
	reducedMotion,
}: Options): Promise<void> {
	if (!projectTransitionStore.tryStart()) return;
	const overlay = projectTransitionStore.getOverlay();
	// Un échec de chargement ne bloque pas la transition : le routeur retentera, et affichera l'erreur
	const loading = load().then(
		() => undefined,
		() => undefined,
	);
	let isCovered = false;

	try {
		if (!overlay || reducedMotion) {
			await loading;
			navigate();
			return;
		}

		await overlay.cover(effect, palette, isDark, origin);
		isCovered = true;

		// Un chargement déjà fini l'emporte tout de suite sur l'attente
		const isSlow = await Promise.race([
			loading.then(() => false),
			wait(TIP_AFTER_MS).then(() => true),
		]);
		if (isSlow && tip) {
			overlay.showTip(tip);
			await Promise.all([loading, wait(TIP_MIN_MS)]);
			await overlay.hideTip();
		} else {
			await loading;
		}

		const pageReady = projectTransitionStore.waitForPageReady(
			PAGE_READY_TIMEOUT_MS,
		);
		navigate();
		await pageReady;
		await waitForNextPaint();
	} finally {
		// Même après une erreur, l'écran ne reste pas couvert
		if (overlay && isCovered) await overlay.reveal();
		projectTransitionStore.finish();
	}
}
