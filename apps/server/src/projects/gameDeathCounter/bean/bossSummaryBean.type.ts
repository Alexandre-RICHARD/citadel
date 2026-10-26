export type BossSummaryBean = {
	id: number;
	gameId: number;
	name: string;
	// La plus ancienne et la plus récente des dates parmi ses morts et sa victoire ; null sans mort ni victoire.
	// Vaincu sans mourir : les deux valent `defeatedAt`. `defeatedAt - firstTry` : le temps pour le vaincre
	firstTry: Date | null;
	lastTry: Date | null;
	defeatedAt: Date | null;
	totalDeath: number;
};
