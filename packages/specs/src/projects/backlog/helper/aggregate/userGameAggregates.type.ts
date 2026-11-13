import type { StatusEnum } from "../../enum/status.enum.ts";

// Ce qu'affiche la ligne d'un jeu du backlog : calculé, jamais stocké
export type UserGameAggregates = {
	// Le plus avancé des statuts (dans l'ordre de l'échelle)
	status: StatusEnum;
	// Au moins une version jouée
	isOwned: boolean;
	// Au moins une version jouée ; la ligne est mise en valeur
	isInProgress: boolean;
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
	// Versions jouées qui ont un commentaire : la ligne n'en montre le texte que s'il n'y en a qu'un, sinon ce nombre
	commentCount: number;
};
