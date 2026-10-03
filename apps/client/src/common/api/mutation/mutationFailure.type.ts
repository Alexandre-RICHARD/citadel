export type MutationFailure = {
	// « Impossible de {action} : {raison}. »
	message: string;
	// Présent seulement pour un échec passager : rejoue la mutation avec la même saisie
	retry?: () => void;
};
