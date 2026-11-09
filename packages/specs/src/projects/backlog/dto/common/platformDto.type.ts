import type { SubPlatformTypeEnum } from "../../enum/subPlatformType.enum.ts";

// Plateforme IGDB, ou sous-plateforme (émulateur, launcher) rattachée à sa plateforme parente
export type PlatformDto = {
	// id IGDB ; une sous-plateforme, absente d'IGDB, a un id négatif
	id: number;
	// Abréviation IGDB (« PS2 »), sinon son nom ; choisi à la main pour une sous-plateforme
	shortName: string;
	// slug IGDB (« ps2 »), ou choisi à la main pour une sous-plateforme (« pcsx2 », « steam ») : nomme l'icône de la plateforme
	technicalName: string;
	// Plateforme dont elle dépend (la console qu'un émulateur émule, le PC d'un launcher) ; null pour une plateforme IGDB
	parentPlatformId: number | null;
	// Émulateur ou launcher ; null si elle n'a pas de parent
	subPlatformType: SubPlatformTypeEnum | null;
};
