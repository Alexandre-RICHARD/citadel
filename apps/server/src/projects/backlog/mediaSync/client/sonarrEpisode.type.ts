import type { z } from "zod";

import type { sonarrEpisodeSchema } from "./sonarrEpisodeSchema.ts";

export type SonarrEpisode = z.infer<typeof sonarrEpisodeSchema>;
