// Pourquoi une ligne de la liste importée n'est pas reprise
export enum MediaImportRejectionEnum {
	// TMDB ne connaît pas cet identifiant pour ce type (un film donné comme série, par exemple)
	TMDB_NOT_FOUND = "tmdb_not_found",
	// Le même média plus haut dans la liste
	DUPLICATE = "duplicate",
	ALREADY_IN_BACKLOG = "already_in_backlog",
}
