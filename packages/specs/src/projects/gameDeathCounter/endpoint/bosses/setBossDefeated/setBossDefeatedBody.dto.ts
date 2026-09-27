import type { z } from "zod";

import type { setBossDefeatedBodySchema } from "./setBossDefeatedBody.schema.ts";

export type SetBossDefeatedBodyDto = z.infer<typeof setBossDefeatedBodySchema>;
