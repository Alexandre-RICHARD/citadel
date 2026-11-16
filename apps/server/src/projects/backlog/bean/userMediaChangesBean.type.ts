// Les champs modifiés d'une ligne ; un champ absent ne change pas
export type UserMediaChangesBean = {
	isWatched?: boolean;
	isUpNext?: boolean;
	isInProgress?: boolean;
	comment?: string | null;
};
