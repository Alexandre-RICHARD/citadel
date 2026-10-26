import type { PlatformDto } from "../common/platformDto.type.ts";

// Haut de page du backlog : résumé du tableau, bouton « Ma base », choix du filtre Plateforme
export type BacklogOverviewDto = {
	gameCount: number;
	userVersionCount: number;
	// Jeux en base hors backlog
	outsideBacklogGameCount: number;
	// Plateformes d'au moins une version jouée, triées par nom
	playedPlatforms: PlatformDto[];
};
