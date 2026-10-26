export type GamePreviewDlcDto = {
	id: number;
	name: string;
	// En base comme DLC de ce jeu
	isStored: boolean;
	// En base comme jeu à part (règle « DLC comme jeu ») : son id ; null sinon
	storedGameId: number | null;
};
