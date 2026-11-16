import type { z } from "zod";

import type { unlinkedMediaSchema } from "./unlinkedMediaSchema.ts";

export type UnlinkedMedia = z.infer<typeof unlinkedMediaSchema>;
