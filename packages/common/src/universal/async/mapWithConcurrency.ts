/**
 * `items.map(mapper)` avec au plus `limit` appels en cours à la fois : chaque appel fini laisse partir le suivant.
 * Les résultats gardent l'ordre de `items`. Une erreur arrête le tout (comme Promise.all) ; les appels déjà partis
 * finissent quand même
 */
export async function mapWithConcurrency<Item, Result>(
	items: readonly Item[],
	limit: number,
	mapper: (item: Item, index: number) => Promise<Result>,
): Promise<Result[]> {
	const results = new Array<Result>(items.length);
	let nextIndex = 0;

	async function work(): Promise<void> {
		while (nextIndex < items.length) {
			const index = nextIndex;
			nextIndex += 1;
			// eslint-disable-next-line no-await-in-loop -- chaque travailleur enchaîne ses appels, un à la fois
			results[index] = await mapper(items[index], index);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, () => work()),
	);
	return results;
}
