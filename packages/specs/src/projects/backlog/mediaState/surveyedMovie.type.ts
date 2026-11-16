import type { z } from "zod";

import type { surveyedMovieSchema } from "./surveyedMovieSchema.ts";

export type SurveyedMovie = z.infer<typeof surveyedMovieSchema>;
