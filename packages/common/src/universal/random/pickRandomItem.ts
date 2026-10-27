// Une liste qu'on sait remplie (un tuple `as const`) donne toujours un élément
type PickedItem<Items extends readonly unknown[]> = Items extends readonly [
	unknown,
	...unknown[],
]
	? Items[number]
	: Items[number] | undefined;

// Un élément au hasard ; undefined pour une liste vide
export function pickRandomItem<Items extends readonly unknown[]>(
	items: Items,
): PickedItem<Items> {
	return items[Math.floor(Math.random() * items.length)] as PickedItem<Items>;
}
