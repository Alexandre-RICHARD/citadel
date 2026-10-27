// Nouvelle liste où seul l'élément `id` est transformé ; la liste d'origine, partagée par le cache, reste intacte
export function replaceById<Item extends { id: number }>(
	items: readonly Item[],
	id: number,
	update: (item: Item) => Item,
): Item[] {
	return items.map((item) => (item.id === id ? update(item) : item));
}
