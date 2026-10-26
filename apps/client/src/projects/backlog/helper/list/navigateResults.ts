type NavigationKeyEvent = { key: string; preventDefault: () => void };

// ↓, ↑ et Entrée dans le champ d'une liste de résultats ; `true` si la touche a servi
export function navigateResults(
	event: NavigationKeyEvent,
	activeIndex: number,
	count: number,
	setActiveIndex: (index: number) => void,
	selectActive: () => void,
): boolean {
	if (count === 0) return false;
	if (event.key === "ArrowDown") {
		event.preventDefault();
		setActiveIndex(Math.min(activeIndex + 1, count - 1));
		return true;
	}
	if (event.key === "ArrowUp") {
		event.preventDefault();
		setActiveIndex(Math.max(activeIndex - 1, 0));
		return true;
	}
	if (event.key === "Enter" && activeIndex >= 0) {
		event.preventDefault();
		selectActive();
		return true;
	}
	return false;
}
