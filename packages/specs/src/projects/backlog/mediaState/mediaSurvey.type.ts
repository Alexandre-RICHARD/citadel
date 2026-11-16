import type { z } from "zod";

import type { mediaSurveySchema } from "./mediaSurveySchema.ts";

export type MediaSurvey = z.infer<typeof mediaSurveySchema>;
