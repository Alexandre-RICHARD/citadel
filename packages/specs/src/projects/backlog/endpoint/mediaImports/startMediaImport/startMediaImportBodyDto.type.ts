import type { z } from "zod";

import type { startMediaImportBodySchema } from "./startMediaImportBodySchema.ts";

export type StartMediaImportBodyDto = z.infer<
	typeof startMediaImportBodySchema
>;
