export type StoredGameSummaryBean = {
	id: number;
	name: string;
	frenchName: string | null;
	releaseYear: number | null;
	coverImageId: string | null;
	platformNames: string[];
};
