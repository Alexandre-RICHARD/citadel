import { useIsScrolled } from "@citadel/common/src/react/hooks/useIsScrolled";
import { usePrefersReducedMotion } from "@citadel/common/src/react/hooks/usePrefersReducedMotion";
import { ArrowUp } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";

// Défilement à partir duquel le bouton pulse : l'en-tête du tableau a quitté l'écran
const FAR_SCROLL_PIXELS = 300;

// « Remonter en haut », au coin du tableau : toujours là, grisé tant que la page est tout en haut, il flashe une fois la page bien défilée
export function ScrollTopButton() {
	const isScrolled = useIsScrolled(0);
	const isFarScrolled = useIsScrolled(FAR_SCROLL_PIXELS);
	const prefersReducedMotion = usePrefersReducedMotion();

	return (
		<Button
			icon={ArrowUp}
			variant="ghost"
			size="sm"
			ariaLabel="Remonter en haut"
			tooltip="Remonter en haut du tableau"
			tooltipPlacement="right"
			disabled={!isScrolled}
			className={isFarScrolled ? styles.scrollTopPulse : undefined}
			onClick={() =>
				window.scrollTo({
					top: 0,
					behavior: prefersReducedMotion ? "instant" : "smooth",
				})
			}
		/>
	);
}
