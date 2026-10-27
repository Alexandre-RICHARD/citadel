// Nombre au hasard entre min (inclus) et max (exclu)
export function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min);
}
