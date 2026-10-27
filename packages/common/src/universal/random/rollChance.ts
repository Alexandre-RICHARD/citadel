// Vrai avec la probabilité donnée, entre 0 (jamais) et 1 (toujours)
export function rollChance(probability: number): boolean {
	return Math.random() < probability;
}
