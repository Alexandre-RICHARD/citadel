// Nouvelle liste où les éléments aux deux places sont échangés ; une copie inchangée si une place n'existe pas
export function swapItems<Item>(
	items: readonly Item[],
	index: number,
	otherIndex: number,
): Item[] {
	const swapped = [...items];
	if (!(index in swapped) || !(otherIndex in swapped)) return swapped;
	[swapped[index], swapped[otherIndex]] = [swapped[otherIndex], swapped[index]];
	return swapped;
}
