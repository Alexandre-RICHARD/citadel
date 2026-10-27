import type { StatusEnum } from "../../enum/status.enum.ts";

// Ce qu'affiche la ligne d'un jeu du backlog : calculé, jamais stocké. `null` : impossible de choisir
export type UserGameAggregates = {
	// Meilleur statut
	status: StatusEnum | null;
	// Au moins une version jouée
	isOwned: boolean;
	// Au moins une version jouée ; la ligne est mise en valeur
	isUpNext: boolean;
	// La plus ancienne : la première fin
	finishDate: string | null;
	sureFinishCount: number;
	probableFinishCount: number;
	// Un DLC compte comme fait s'il l'est sur au moins une version jouée
	doneDlcCount: number;
	dlcCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	totalPlayTimeMinutes: number;
	// La plus haute
	rating: number | null;
	// Le commentaire s'il n'y en a qu'un
	comment: string | null;
};
