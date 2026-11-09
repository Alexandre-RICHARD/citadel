export type GamePreviewDlcDto = {
	id: number;
	name: string;
	// Sa page IGDB ; null pour un DLC que seule la base connaît
	igdbUrl: string | null;
	// En base comme DLC de ce jeu
	isStored: boolean;
	// En base comme jeu à part (règle « DLC comme jeu ») : son id ; null sinon
	storedGameId: number | null;
};
