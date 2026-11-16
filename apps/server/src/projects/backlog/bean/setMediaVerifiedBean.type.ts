// Les cases « Vérifié » d'un film (sans épisodes) ou d'épisodes d'une série
export type SetMediaVerifiedBean = {
	userMediaId: number;
	episodeIds: number[] | null;
	isVerified: boolean;
};
