// Les étiquettes de la colonne « Langues » (§5), chacune aussi valeur de son filtre
export enum LanguageTagEnum {
	// Une piste audio en français
	VF = "vf",
	// Une piste audio dans la langue originale du média, celle de TMDB
	VO = "vo",
	// Des sous-titres français
	STFR = "stfr",
	// Des sous-titres dans la langue originale
	STVO = "stvo",
	// Aucune piste audio de langue connue (pistes non étiquetées) : à ne pas confondre avec un fichier sans VF
	UNKNOWN = "unknown",
}
