export function removeById<Item extends { id: number }>(
	items: readonly Item[],
	id: number,
): Item[] {
	return items.filter((item) => item.id !== id);
}
