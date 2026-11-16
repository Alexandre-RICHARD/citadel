// Colonnes du tableau des films et séries en mode classique, dans l'ordre par défaut : la partie commune aux deux modes
// finit par « Vu » et « À voir bientôt » (§5). Leur clé nomme aussi leur filtre dans l'URL et dans la query de getAllUserMedia
export enum MediaColumnEnum {
	THUMBNAIL = "thumbnail",
	TITLE = "title",
	MEDIA_TYPE = "mediaType",
	ORIGINAL_LANGUAGE = "originalLanguage",
	SAGA = "saga",
	SAGA_NUMBER = "sagaNumber",
	RELEASE_DATE = "releaseDate",
	RUNTIME = "runtime",
	IN_PROGRESS = "inProgress",
	COMMENT = "comment",
	WATCHED = "watched",
	UP_NEXT = "upNext",
	// Masqué par défaut, il s'affiche par « Colonnes »
	TMDB_ID = "tmdbId",
	ACTIONS = "actions",
}
