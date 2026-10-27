// Ramène number entre min et max ; si les bornes se croisent (max < min), min l'emporte
export function clamp(number: number, min: number, max: number): number {
	return Math.max(min, Math.min(number, max));
}
