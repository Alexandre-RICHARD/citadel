// Images d'un jeu, relues à l'ajout au backlog et par « Personnaliser »
export type IgdbGameImages = {
	id: number;
	cover?: { image_id: string };
	artworks?: { image_id: string }[];
};
