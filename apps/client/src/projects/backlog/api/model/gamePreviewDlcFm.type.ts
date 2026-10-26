export type GamePreviewDlcFm = {
	id: number;
	name: string;
	isStored: boolean;
	// Déjà en base comme jeu à part : la case « Comme jeu » est grisée
	storedGameId: number | null;
};
