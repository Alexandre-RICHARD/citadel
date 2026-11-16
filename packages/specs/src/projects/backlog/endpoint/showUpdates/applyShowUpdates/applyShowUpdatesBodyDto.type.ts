import type { z } from "zod";

import type { applyShowUpdatesBodySchema } from "./applyShowUpdatesBodySchema.ts";

export type ApplyShowUpdatesBodyDto = z.infer<
	typeof applyShowUpdatesBodySchema
>;
