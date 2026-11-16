import type { TmdbShowData } from "../tmdb/type/tmdbShowData.type.ts";

export type ShowPreviewBean = {
	show: TmdbShowData;
	userMediaId: number | null;
};
