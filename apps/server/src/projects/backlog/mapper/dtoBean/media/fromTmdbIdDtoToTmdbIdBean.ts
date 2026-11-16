import type { TmdbIdBean } from "../../../bean/tmdbIdBean.type.ts";

// Le chemin des fiches d'un film ou d'une série : l'identifiant TMDB seul
export function fromTmdbIdDtoToTmdbIdBean(pathParamDto: {
	tmdbId: number;
}): TmdbIdBean {
	return { tmdbId: pathParamDto.tmdbId };
}
