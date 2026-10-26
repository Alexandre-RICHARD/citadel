// La version d'une version jouée
export type UserVersionVersionDto = {
	id: number;
	// null pour la version originale
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
};
