// La valeur à ratio du chemin entre from et to : 0 donne from, 1 donne to, au-delà on prolonge
export function interpolate(from: number, to: number, ratio: number): number {
	return from + (to - from) * ratio;
}
