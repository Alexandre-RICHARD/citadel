// Qualité de l'image d'un fichier, d'après la meilleure des deux mesures, largeur ou hauteur (§5), de la moins bonne à la
// meilleure. Une saison ou une série prend la moins bonne de ses épisodes
export enum NasQualityEnum {
	SD = "sd",
	// 1280 ou 720
	HD = "hd",
	// 1920 ou 1080
	FHD = "fhd",
	// 3840 ou 2160
	UHD = "4k",
}
