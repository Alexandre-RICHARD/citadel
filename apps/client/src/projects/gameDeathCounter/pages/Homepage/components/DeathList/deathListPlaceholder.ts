import type { DeathFm } from "../../../../api/model/deathFm.type";

function buildPlaceholderDeath(id: number, comment: string): DeathFm {
	return {
		id,
		date: "2026-01-01T20:00:00.000Z",
		comment,
		isTemporary: false,
	};
}

// Données factices que le Skeleton transforme en silhouette : seules leurs longueurs de texte comptent
export const DEATH_LIST_PLACEHOLDER: DeathFm[] = [
	buildPlaceholderDeath(1, "Roulade ratée sur le combo double faux"),
	buildPlaceholderDeath(2, "Presque, il ne restait qu'un tiers de vie"),
	buildPlaceholderDeath(3, "Phase 2 imparable"),
];
