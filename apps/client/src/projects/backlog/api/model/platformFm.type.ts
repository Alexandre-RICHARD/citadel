import type { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum";

// Plateforme IGDB, ou sous-plateforme (id négatif : émulateur, launcher) rattachée à sa plateforme parente
export type PlatformFm = {
	id: number;
	shortName: string;
	// Nomme l'icône de la plateforme
	technicalName: string;
	parentPlatformId: number | null;
	subPlatformType: SubPlatformTypeEnum | null;
};
