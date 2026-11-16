import type { TmdbMovieData } from "../tmdb/type/tmdbMovieData.type.ts";
import type { ProposedSagaBean } from "./proposedSagaBean.type.ts";

export type MoviePreviewBean = {
	movie: TmdbMovieData;
	proposedSaga: ProposedSagaBean | null;
	userMediaId: number | null;
};
