// La plus tardive des deux heures (en millisecondes) ; null quand aucune n'est donnée
export function pickLaterTime(
	first: number | null,
	second: number | null,
): number | null {
	if (first === null) return second;
	if (second === null) return first;
	return Math.max(first, second);
}
