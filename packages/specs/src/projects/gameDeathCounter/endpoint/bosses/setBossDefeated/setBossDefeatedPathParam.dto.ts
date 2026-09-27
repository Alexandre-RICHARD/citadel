import type { z } from "zod";

import type { setBossDefeatedPathParamSchema } from "./setBossDefeatedPathParam.schema.ts";

export type SetBossDefeatedPathParamDto = z.infer<
	typeof setBossDefeatedPathParamSchema
>;
