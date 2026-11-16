import type { z } from "zod";

import type { surveyedShowSchema } from "./surveyedShowSchema.ts";

export type SurveyedShow = z.infer<typeof surveyedShowSchema>;
