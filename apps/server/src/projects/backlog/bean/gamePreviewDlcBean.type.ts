export type GamePreviewDlcBean = {
	id: number;
	name: string;
	// Sa page IGDB ; null pour un DLC que seule la base connaît
	igdbUrl: string | null;
	isStored: boolean;
	storedGameId: number | null;
};
