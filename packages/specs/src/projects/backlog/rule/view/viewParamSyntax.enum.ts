// Écriture du tri et des filtres, la même dans l'URL de la page et dans la query de getUserGames :
// `?sort=releaseDate:desc,name:asc&series==The+Witcher&rating=10..18&owned=oui`
export enum ViewParamSyntaxEnum {
	SORT_PARAM = "sort",
	SORT_SEPARATOR = ",",
	SORT_DIRECTION_SEPARATOR = ":",
	// Filtre texte à valeur exacte, après un clic sur une série
	EXACT_PREFIX = "=",
	// Bornes d'un intervalle, chacune facultative : `10..`, `..18`
	RANGE_SEPARATOR = "..",
	YES = "oui",
	NO = "non",
}
