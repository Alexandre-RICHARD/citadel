import type { z } from "zod";

import type { radarrMovieSchema } from "./radarrMovieSchema.ts";

export type RadarrMovie = z.infer<typeof radarrMovieSchema>;
