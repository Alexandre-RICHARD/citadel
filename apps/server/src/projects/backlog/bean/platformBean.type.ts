import type { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum.ts";

// Plateforme IGDB, ou sous-plateforme (id négatif : émulateur, launcher) rattachée à sa plateforme parente
export type PlatformBean = {
	id: number;
	shortName: string;
	technicalName: string;
	parentPlatformId: number | null;
	subPlatformType: SubPlatformTypeEnum | null;
};
