// Plateforme IGDB, ou émulateur (id négatif) rattaché à la console qu'il émule
export type PlatformFm = {
	id: number;
	shortName: string;
	// Nomme l'icône de la plateforme
	technicalName: string;
	emulatedPlatformId: number | null;
};
