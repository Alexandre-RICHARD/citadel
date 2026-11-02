import type { z } from "zod";

import type { startMailLoginBodySchema } from "./startMailLoginBodySchema.ts";

export type StartMailLoginBodyDto = z.infer<typeof startMailLoginBodySchema>;
