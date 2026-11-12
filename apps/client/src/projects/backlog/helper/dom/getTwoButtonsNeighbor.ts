// Fenêtre qui n'a que deux boutons : ← va au premier, → au second, d'où que vienne le focus (même de la fenêtre elle-même).
// null : la touche ne change rien
export function getTwoButtonsNeighbor(
	buttons: readonly HTMLElement[],
	key: string,
): HTMLElement | null {
	const [first, second] = buttons;
	if (buttons.length !== 2 || first === undefined || second === undefined)
		return null;
	if (key === "ArrowLeft") return first;
	if (key === "ArrowRight") return second;
	return null;
}
