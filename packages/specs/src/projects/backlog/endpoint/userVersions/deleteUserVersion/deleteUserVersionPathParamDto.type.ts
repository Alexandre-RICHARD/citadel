import type { z } from "zod";

import type { deleteUserVersionPathParamSchema } from "./deleteUserVersionPathParamSchema.ts";

export type DeleteUserVersionPathParamDto = z.infer<
	typeof deleteUserVersionPathParamSchema
>;
