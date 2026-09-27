import type { z } from "zod";

import type { setGameFinishedPathParamSchema } from "./setGameFinishedPathParam.schema.ts";

export type SetGameFinishedPathParamDto = z.infer<
	typeof setGameFinishedPathParamSchema
>;
