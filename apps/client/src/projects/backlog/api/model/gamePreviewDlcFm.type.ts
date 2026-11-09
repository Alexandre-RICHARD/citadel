export type GamePreviewDlcFm = {
	id: number;
	name: string;
	// Sa page IGDB ; null pour un DLC que seule la base connaît
	igdbUrl: string | null;
	isStored: boolean;
	// Déjà en base comme jeu à part : la case « Comme jeu » est grisée
	storedGameId: number | null;
};
