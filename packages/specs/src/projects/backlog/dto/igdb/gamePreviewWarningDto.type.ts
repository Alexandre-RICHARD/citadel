// Fiche IGDB rattachée au jeu comme version, mais d'un type qui n'en fait pas une : ignorée (cahier des charges, §5)
export type GamePreviewWarningDto = {
	igdbId: number;
	name: string;
	// Type IGDB de la fiche (« Bundle », « Remake »…)
	typeName: string;
	// La fiche brute, telle qu'IGDB l'a renvoyée
	entryJson: string;
};
