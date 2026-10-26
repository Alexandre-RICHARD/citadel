// Une fiche IGDB déjà en base comme version, et le jeu qui la porte
export type StoredVersionRow = {
	id: number;
	gameId: number;
	// Booléen SQL : 0 ou 1
	isInBacklog: number;
};
