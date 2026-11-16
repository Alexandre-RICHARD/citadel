// Ce que coche une case « Vérifié » : le fichier d'un film, ou celui d'un épisode (§5)
export type VerificationTarget =
	| { kind: "movie"; tmdbId: number }
	| {
			kind: "episode";
			showTmdbId: number;
			seasonNumber: number;
			episodeNumber: number;
	  };
