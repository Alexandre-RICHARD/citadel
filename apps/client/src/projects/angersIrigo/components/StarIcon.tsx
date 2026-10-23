/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { JSX } from "react";

type StarIconProps = {
	/** Étoile pleine (favori) ou contour seul */
	filled: boolean;
	size?: number;
};

/** Étoile des favoris, de la couleur du texte (currentColor) */
export function StarIcon({ filled, size = 16 }: StarIconProps): JSX.Element {
	return (
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			aria-hidden="true"
		>
			<path
				d="M12 2.8l2.84 5.76 6.36.92-4.6 4.49 1.08 6.33L12 17.31l-5.68 2.99 1.08-6.33-4.6-4.49 6.36-.92z"
				fill={filled ? "currentColor" : "none"}
				stroke="currentColor"
				strokeWidth="2"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
