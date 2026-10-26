// Texte sans espaces autour, `null` s'il est absent ou vide (une API tierce laisse parfois des espaces en trop)
export function trimToNull(text: string | null | undefined): string | null {
	const trimmed = text?.trim();
	return trimmed === undefined || trimmed === "" ? null : trimmed;
}
