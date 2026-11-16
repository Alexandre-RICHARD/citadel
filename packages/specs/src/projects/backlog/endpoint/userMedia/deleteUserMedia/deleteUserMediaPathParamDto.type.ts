import type { z } from "zod";

import type { deleteUserMediaPathParamSchema } from "./deleteUserMediaPathParamSchema.ts";

export type DeleteUserMediaPathParamDto = z.infer<
	typeof deleteUserMediaPathParamSchema
>;
