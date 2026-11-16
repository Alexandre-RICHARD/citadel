import type { z } from "zod";

import type { sonarrEpisodeFileSchema } from "./sonarrEpisodeFileSchema.ts";

export type SonarrEpisodeFile = z.infer<typeof sonarrEpisodeFileSchema>;
