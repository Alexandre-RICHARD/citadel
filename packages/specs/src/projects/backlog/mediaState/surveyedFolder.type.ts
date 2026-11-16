import type { z } from "zod";

import type { surveyedFolderSchema } from "./surveyedFolderSchema.ts";

export type SurveyedFolder = z.infer<typeof surveyedFolderSchema>;
