import type { z } from "zod";

import type { deleteStoredGamePathParamSchema } from "./deleteStoredGamePathParamSchema.ts";

export type DeleteStoredGamePathParamDto = z.infer<
	typeof deleteStoredGamePathParamSchema
>;
