// Défilement vertical seul : scrollIntoView recentrait aussi la ligne en largeur, et le tableau dépasse de l'écran.
// La ligne garde une ligne de marge de chaque côté, pour déborder un peu sur ses voisines : en haut elle s'arrête sous
// l'en-tête collant (sa scroll-margin-top), en bas au-dessus de la barre de défilement horizontale (clientHeight)
function scrollRowIntoViewVertically(row: HTMLElement): void {
	const { top, bottom, height } = row.getBoundingClientRect();
	const topLimit =
		(Number.parseFloat(getComputedStyle(row).scrollMarginTop) || 0) + height;
	const bottomLimit = document.documentElement.clientHeight - height;
	if (top < topLimit) window.scrollBy({ top: top - topLimit });
	else if (bottom > bottomLimit) window.scrollBy({ top: bottom - bottomLimit });
}

// Donne le focus à la ligne qui précède ou suit celle-ci, en sautant les lignes inertes (en attente du serveur) ; ne fait rien au bout du tableau
export function focusSiblingRow(
	row: HTMLElement,
	direction: "previous" | "next",
): void {
	let sibling =
		direction === "previous"
			? row.previousElementSibling
			: row.nextElementSibling;
	while (sibling instanceof HTMLElement && sibling.inert) {
		sibling =
			direction === "previous"
				? sibling.previousElementSibling
				: sibling.nextElementSibling;
	}
	if (sibling instanceof HTMLElement) {
		sibling.focus({ preventScroll: true });
		scrollRowIntoViewVertically(sibling);
	}
}
