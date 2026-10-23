/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./LineBadge.scss";

import type { CSSProperties, JSX } from "react";

type LineBadgeProps = {
	label: string;
	/** Couleur de fond ; couleur neutre si absente */
	color?: string | undefined;
	textColor?: string | undefined;
	/** Petite pastille, pour les listes de lignes (résultats de recherche) */
	size?: "normal" | "small";
};

/** Pastille de ligne aux couleurs officielles, ex : « A » sur fond rouge */
export function LineBadge({
	label,
	color,
	textColor,
	size = "normal",
}: LineBadgeProps): JSX.Element {
	// Variables CSS consommées par LineBadge.scss, qui prévoit des valeurs par défaut
	const style = {
		"--line-color": color,
		"--line-text-color": textColor,
	} as CSSProperties;

	return (
		<span
			className={
				size === "small" ? "line-badge line-badge--small" : "line-badge"
			}
			style={style}
		>
			{label}
		</span>
	);
}
