// Une vérification de nuit des identifiants TMDB : combien ont été relus, et combien TMDB ne connaît plus
export type TmdbIdCheckResultBean = {
	checkedCount: number;
	goneCount: number;
};
