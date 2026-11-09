import { useEffect, useState } from "react";

/**
 * La page est défilée de plus de `thresholdPixels` : de quoi montrer un bouton « Remonter en haut » seulement quand
 * il sert
 */
export function useIsScrolled(thresholdPixels: number): boolean {
	const [isScrolled, setIsScrolled] = useState(
		() => window.scrollY > thresholdPixels,
	);

	useEffect(() => {
		function update() {
			setIsScrolled(window.scrollY > thresholdPixels);
		}
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, [thresholdPixels]);

	return isScrolled;
}
