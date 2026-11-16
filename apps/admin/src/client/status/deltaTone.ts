import type { StatusTone } from "./statusTone.type";

/**
 * La couleur de l'écart d'un chiffre du rapport : `better` dit dans quel sens il s'améliore (plus de torrents valides,
 * moins de morts) ; « idle » pour un chiffre sans bon sens (le nombre de torrents)
 */
export function deltaTone(
	current: number,
	previous: number | null,
	better: "up" | "down" | "none",
): StatusTone {
	if (previous === null || current === previous || better === "none")
		return "idle";
	return current > previous === (better === "up") ? "ok" : "danger";
}
