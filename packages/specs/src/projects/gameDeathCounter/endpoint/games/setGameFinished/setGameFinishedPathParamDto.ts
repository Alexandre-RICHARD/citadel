import type { z } from "zod";

import type { setGameFinishedPathParamSchema } from "./setGameFinishedPathParamSchema.ts";

export type SetGameFinishedPathParamDto = z.infer<
	typeof setGameFinishedPathParamSchema
>;
