import type { z } from "zod";

import type { storeGameBodySchema } from "./storeGameBodySchema.ts";

export type StoreGameBodyDto = z.infer<typeof storeGameBodySchema>;
