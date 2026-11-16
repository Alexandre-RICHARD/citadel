// La vérification de nuit des identifiants TMDB (media-tmdb) : médias relus, et ceux que TMDB ne connaît plus
export type TmdbIdCheckResultDto = {
	checkedCount: number;
	goneCount: number;
};
