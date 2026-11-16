import type { z } from "zod";

import type { surveyedEpisodeSchema } from "./surveyedEpisodeSchema.ts";

export type SurveyedEpisode = z.infer<typeof surveyedEpisodeSchema>;
