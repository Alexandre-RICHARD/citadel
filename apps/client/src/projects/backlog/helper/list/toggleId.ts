// Coche ou décoche un id dans une liste
export function toggleId(ids: readonly number[], id: number): number[] {
	return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id];
}
