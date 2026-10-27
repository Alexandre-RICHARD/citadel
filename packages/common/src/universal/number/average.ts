import { sum } from "./sum.ts";

// null sans valeur : une moyenne de rien n'existe pas
export function average(values: readonly number[]): number | null {
	return values.length === 0 ? null : sum(values) / values.length;
}
