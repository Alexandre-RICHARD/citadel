// Retire l'élément s'il y est, l'ajoute à la fin sinon : une case qu'on coche ou décoche dans une liste
export function toggleArrayItem<Item>(
	items: readonly Item[],
	item: Item,
): Item[] {
	return items.includes(item)
		? items.filter((other) => other !== item)
		: [...items, item];
}
