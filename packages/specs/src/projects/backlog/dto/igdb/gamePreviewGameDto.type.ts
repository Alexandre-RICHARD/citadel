// Données propres au jeu, montrées dans la modale du jeu
export type GamePreviewGameDto = {
	// id IGDB de sa fiche originale, qui est aussi l'id du jeu en base
	id: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
	isCancelled: boolean;
	igdbUrl: string;
};
