import type { GameSummaryFm } from "../../../../api/model/gameSummaryFm.type";

function buildPlaceholderGame(id: number, name: string): GameSummaryFm {
	return {
		id,
		name,
		startedAt: "2026-01-01T00:00:00.000Z",
		endedAt: null,
		totalDeath: 10,
		isFinished: false,
		isTemporary: false,
	};
}

// Données factices que le Skeleton transforme en silhouette : seules leurs longueurs de texte comptent
export const GAME_LIST_PLACEHOLDER: GameSummaryFm[] = [
	buildPlaceholderGame(1, "Elden Ring"),
	buildPlaceholderGame(2, "Sekiro: Shadows Die Twice"),
	buildPlaceholderGame(3, "Hollow Knight"),
];
