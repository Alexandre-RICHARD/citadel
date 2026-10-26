import type { StatusEnum } from "../../enum/status.enum.ts";
import type { PlatformDto } from "../common/platformDto.type.ts";
import type { UserVersionVersionDto } from "./userVersionVersionDto.type.ts";

// Version jouée : une version sur une plateforme, avec les données de jeu de l'utilisateur
export type UserVersionDto = {
	id: number;
	version: UserVersionVersionDto;
	platform: PlatformDto;
	// Sortie de la version sur cette plateforme ; pour un émulateur, sur la console émulée
	releaseDate: string | null;
	status: StatusEnum;
	isOwned: boolean;
	isUpNext: boolean;
	finishDate: string | null;
	sureFinishCount: number;
	probableFinishCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	// Entier de 0 à 20 ; null si pas noté
	rating: number | null;
	comment: string | null;
	// DLC du jeu cochés comme faits
	doneDlcIds: number[];
};
