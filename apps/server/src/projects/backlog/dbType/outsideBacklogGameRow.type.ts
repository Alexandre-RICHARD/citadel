// Un jeu de « Ma base », lu en SQL brut avec la cover de sa version originale
export type OutsideBacklogGameRow = {
	id: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
	coverImageId: string | null;
};
