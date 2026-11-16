import type { z } from "zod";

import type { sonarrSeriesSchema } from "./sonarrSeriesSchema.ts";

export type SonarrSeries = z.infer<typeof sonarrSeriesSchema>;
