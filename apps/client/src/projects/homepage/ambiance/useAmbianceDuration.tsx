import type { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { useState } from "react";

// Durées du glissement des couleurs, en secondes
const INSTANT = 0.01;
const PROJECT_CHANGE = 2.4;
const PROJECT_CHANGE_REDUCED = 0.6;
const SCHEME_CHANGE = 0.7;
const SCHEME_CHANGE_REDUCED = 0.2;

type Tracked = {
	ambianceKey: string;
	colorScheme: ColorSchemeEnum;
	duration: number;
};

// Combien de temps les couleurs mettent à glisser vers la nouvelle ambiance : instantané à l'arrivée,
// quelques secondes d'un projet à l'autre, moins pour basculer entre clair et sombre
export function useAmbianceDuration(
	ambianceKey: string,
	colorScheme: ColorSchemeEnum,
	reducedMotion: boolean,
): number {
	const [tracked, setTracked] = useState<Tracked>({
		ambianceKey,
		colorScheme,
		duration: INSTANT,
	});

	// Ajusté pendant le rendu, d'après le rendu précédent : la durée est prête en même temps que les couleurs
	if (
		tracked.ambianceKey !== ambianceKey ||
		tracked.colorScheme !== colorScheme
	) {
		const isSchemeChange = tracked.colorScheme !== colorScheme;
		const duration = isSchemeChange
			? reducedMotion
				? SCHEME_CHANGE_REDUCED
				: SCHEME_CHANGE
			: reducedMotion
				? PROJECT_CHANGE_REDUCED
				: PROJECT_CHANGE;
		setTracked({ ambianceKey, colorScheme, duration });
		return duration;
	}

	return tracked.duration;
}
