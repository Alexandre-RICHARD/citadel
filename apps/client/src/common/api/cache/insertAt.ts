// Réinsère un élément à sa place ; si la liste a raccourci entre-temps, il va à la fin
export function insertAt<Item>(
	items: readonly Item[],
	index: number,
	item: Item,
): Item[] {
	return [...items.slice(0, index), item, ...items.slice(index)];
}
