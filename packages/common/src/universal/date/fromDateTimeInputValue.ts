// Inverse de toDateTimeInputValue : la saisie, en heure locale, devient une date ISO. null si le champ est vide ou invalide
export function fromDateTimeInputValue(value: string): string | null {
	if (value === "") return null;
	// Sans fuseau, une date-heure se lit en heure locale
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;

	return date.toISOString();
}
