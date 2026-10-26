const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not(:disabled)",
	"input:not(:disabled)",
	"select:not(:disabled)",
	"textarea:not(:disabled)",
	'[tabindex]:not([tabindex="-1"])',
].join(",");

// Éléments atteignables avec Tab dans un conteneur, dans l'ordre du document
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return [
		...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
	].filter(
		(element) =>
			!element.closest("[inert]") && element.getClientRects().length > 0,
	);
}
