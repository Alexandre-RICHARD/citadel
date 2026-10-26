// Résumé d'un intervalle de filtre : « ≥ 10 », « ≤ 20 », « 10 – 20 » ; null sans borne
export function formatRangeSummary(
	min: string | null,
	max: string | null,
): string | null {
	if (min !== null && max !== null) return `${min} – ${max}`;
	if (min !== null) return `≥ ${min}`;
	return max === null ? null : `≤ ${max}`;
}
