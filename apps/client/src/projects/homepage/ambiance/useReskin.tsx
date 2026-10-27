import { gsap } from "gsap";
import { type RefObject, useEffect, useRef, useState } from "react";

import type { AmbianceFonts } from "./ambianceFonts.type";

const FADE_OUT_SECONDS = 0.18;
const FADE_IN_SECONDS = 0.4;

function toKey(fonts: AmbianceFonts): string {
	return `${fonts.fontFamilyPrimary}|${fonts.fontFamilySecondary}|${fonts.textTransformDisplay}`;
}

// Les polices ne glissent pas comme les couleurs : les textes marqués data-reskin (nom du site, roue, footer)
// s'effacent un instant, changent de police, puis reviennent. Rend les polices à afficher.
// fonts doit être mémoïsé : un nouvel objet relance le fondu
export function useReskin(
	rootRef: RefObject<HTMLElement | null>,
	fonts: AmbianceFonts,
	reducedMotion: boolean,
): AmbianceFonts {
	const [displayedFonts, setDisplayedFonts] = useState(fonts);
	const displayedKey = toKey(displayedFonts);
	const targetKey = toKey(fonts);
	const isFadingOut = useRef(false);
	const fadedInKey = useRef(displayedKey);

	// Animations réduites : changement immédiat, ajusté pendant le rendu
	if (reducedMotion && displayedKey !== targetKey) setDisplayedFonts(fonts);

	useEffect(() => {
		const root = rootRef.current;
		if (!root || reducedMotion) return undefined;
		const targets = root.querySelectorAll("[data-reskin]");

		if (displayedKey === targetKey) {
			// Retour aux polices déjà affichées pendant le fondu : les textes reviennent
			if (isFadingOut.current) {
				isFadingOut.current = false;
				gsap.to(targets, {
					opacity: 1,
					duration: FADE_IN_SECONDS,
					ease: "power1.out",
					overwrite: true,
				});
			}
			return undefined;
		}

		isFadingOut.current = true;
		const fadeOut = gsap.to(targets, {
			opacity: 0,
			duration: FADE_OUT_SECONDS,
			ease: "power1.in",
			overwrite: true,
			onComplete() {
				isFadingOut.current = false;
				setDisplayedFonts(fonts);
			},
		});
		return () => {
			fadeOut.kill();
		};
	}, [rootRef, fonts, displayedKey, targetKey, reducedMotion]);

	// Les nouvelles polices sont posées : les textes reviennent
	useEffect(() => {
		const root = rootRef.current;
		if (!root || fadedInKey.current === displayedKey) return;
		fadedInKey.current = displayedKey;
		gsap.to(root.querySelectorAll("[data-reskin]"), {
			opacity: 1,
			duration: FADE_IN_SECONDS,
			ease: "power1.out",
			overwrite: true,
		});
	}, [rootRef, displayedKey]);

	return displayedFonts;
}
