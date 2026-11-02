import type { z } from "zod";

import type { submitFlowCodeBodySchema } from "./submitFlowCodeBodySchema.ts";

export type SubmitFlowCodeBodyDto = z.infer<typeof submitFlowCodeBodySchema>;
