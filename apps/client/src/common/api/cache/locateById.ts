import type { LocatedItem } from "./locatedItem.type";

export function locateById<Item extends { id: number }>(
	items: readonly Item[] | undefined,
	id: number,
): LocatedItem<Item> | null {
	const index = items?.findIndex((item) => item.id === id) ?? -1;
	const item = items?.[index];
	return item === undefined ? null : { item, index };
}
