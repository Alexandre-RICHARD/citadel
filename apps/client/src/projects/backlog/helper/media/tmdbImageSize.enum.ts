// Largeurs d'image proposées par TMDB (configuration de l'API) : la miniature du tableau, sa version haute densité, la fiche
export enum TmdbImageSizeEnum {
	THUMB = "w92",
	THUMB_2X = "w185",
	COVER = "w342",
	// Image d'un épisode, en paysage : assez large pour les écrans haute densité
	STILL = "w300",
}
