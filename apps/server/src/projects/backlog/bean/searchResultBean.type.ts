export type SearchResultBean = {
	igdbId: number;
	name: string;
	frenchName: string | null;
	matchedName: string | null;
	releaseYear: number | null;
	coverImageId: string | null;
	platformNames: string[];
	storedGameId: number | null;
	isInBacklog: boolean;
};
