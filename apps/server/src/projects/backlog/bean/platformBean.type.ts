// Plateforme IGDB, ou émulateur (id négatif) rattaché à la console qu'il émule
export type PlatformBean = {
	id: number;
	shortName: string;
	technicalName: string;
	emulatedPlatformId: number | null;
};
