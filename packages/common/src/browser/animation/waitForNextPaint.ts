// Résout une fois l'image suivante peinte : la première frame prépare le rendu, la seconde suit son affichage
export function waitForNextPaint(): Promise<void> {
	return new Promise((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
	);
}
