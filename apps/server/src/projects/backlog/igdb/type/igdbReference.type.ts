// Noms des types de fiche et des statuts de sortie, par id : lus une fois sur IGDB, jamais codés en dur
export type IgdbReference = {
	gameTypes: Map<number, string>;
	gameStatuses: Map<number, string>;
};
