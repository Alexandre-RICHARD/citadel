// « faits / total » ; vide quand le jeu n'a pas de DLC
export function formatDlcProgress(done: number, total: number): string {
	return total === 0 ? "" : `${done} / ${total}`;
}
