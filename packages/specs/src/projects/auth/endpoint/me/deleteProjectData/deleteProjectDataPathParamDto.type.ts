import type { z } from "zod";

import type { deleteProjectDataPathParamSchema } from "./deleteProjectDataPathParamSchema.ts";

export type DeleteProjectDataPathParamDto = z.infer<
	typeof deleteProjectDataPathParamSchema
>;
