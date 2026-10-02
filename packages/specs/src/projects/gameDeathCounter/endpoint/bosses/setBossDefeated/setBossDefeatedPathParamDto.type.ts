import type { z } from "zod";

import type { setBossDefeatedPathParamSchema } from "./setBossDefeatedPathParamSchema.ts";

export type SetBossDefeatedPathParamDto = z.infer<
	typeof setBossDefeatedPathParamSchema
>;
