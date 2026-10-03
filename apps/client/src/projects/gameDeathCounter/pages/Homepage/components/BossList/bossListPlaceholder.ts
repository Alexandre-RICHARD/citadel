import type { BossSummaryFm } from "../../../../api/model/bossSummaryFm.type";

function buildPlaceholderBoss(id: number, name: string): BossSummaryFm {
	return {
		id,
		name,
		firstTry: "2026-01-01T00:00:00.000Z",
		lastTry: null,
		defeatedAt: null,
		totalDeath: 10,
		isDefeated: false,
		isTemporary: false,
	};
}

// Données factices que le Skeleton transforme en silhouette : seules leurs longueurs de texte comptent
export const BOSS_LIST_PLACEHOLDER: BossSummaryFm[] = [
	buildPlaceholderBoss(1, "Margit, le Présage Fêlé"),
	buildPlaceholderBoss(2, "Godrick le Greffé"),
];
