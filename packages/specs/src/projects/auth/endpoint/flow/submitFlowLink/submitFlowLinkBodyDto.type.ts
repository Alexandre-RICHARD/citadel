import type { z } from "zod";

import type { submitFlowLinkBodySchema } from "./submitFlowLinkBodySchema.ts";

export type SubmitFlowLinkBodyDto = z.infer<typeof submitFlowLinkBodySchema>;
