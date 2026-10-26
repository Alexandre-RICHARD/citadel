// Plateforme IGDB, ou émulateur rattaché à la console qu'il émule
export type PlatformDto = {
	// id IGDB ; un émulateur, absent d'IGDB, a un id négatif
	id: number;
	// Abréviation IGDB (« PS2 »), sinon son nom ; choisi à la main pour un émulateur
	shortName: string;
	// slug IGDB (« ps2 »), ou choisi à la main pour un émulateur (« pcsx2 ») : nomme l'icône de la plateforme
	technicalName: string;
	// Console émulée ; null pour une plateforme IGDB
	emulatedPlatformId: number | null;
};
