type ClickLike = {
	button: number;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	defaultPrevented: boolean;
};

/**
 * Clic gauche simple, sans touche modificatrice : le seul clic qu'un lien traite lui-même (navigation dans la page).
 * Clic molette, clic droit, Ctrl/Cmd/Maj/Alt + clic : le navigateur garde la main (nouvel onglet, nouvelle fenêtre…).
 */
export function isPlainLeftClick(event: ClickLike): boolean {
	return (
		!event.defaultPrevented &&
		event.button === 0 &&
		!event.ctrlKey &&
		!event.metaKey &&
		!event.shiftKey &&
		!event.altKey
	);
}
