import type { z } from "zod";

import type { jellyfinItemSchema } from "./jellyfinItemSchema.ts";

export type JellyfinItem = z.infer<typeof jellyfinItemSchema>;
