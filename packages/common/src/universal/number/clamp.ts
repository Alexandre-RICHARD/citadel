// Ramène number entre min et max
export function clamp(number: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, number));
}
