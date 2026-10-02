import type { z } from "zod";

import type { setBossDefeatedBodySchema } from "./setBossDefeatedBodySchema.ts";

export type SetBossDefeatedBodyDto = z.infer<typeof setBossDefeatedBodySchema>;
