import type { z } from "zod";

import type { deleteUserGamePathParamSchema } from "./deleteUserGamePathParamSchema.ts";

export type DeleteUserGamePathParamDto = z.infer<
	typeof deleteUserGamePathParamSchema
>;
