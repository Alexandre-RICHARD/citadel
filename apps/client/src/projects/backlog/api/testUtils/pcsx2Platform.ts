import type { PlatformDto } from "@citadel/specs/src/projects/backlog/dto/common/platformDto.type";

// Émulateur de la PS2 : sa date de sortie est celle de la console émulée
export const PCSX2_PLATFORM: PlatformDto = {
	id: -1,
	shortName: "PCSX2",
	technicalName: "pcsx2",
	emulatedPlatformId: 8,
};
