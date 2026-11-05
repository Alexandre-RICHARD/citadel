import type { z } from "zod";

import type { deleteProjectDataBodySchema } from "./deleteProjectDataBodySchema.ts";

export type DeleteProjectDataBodyDto = z.infer<
	typeof deleteProjectDataBodySchema
>;
