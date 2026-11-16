import type { z } from "zod";

import type { mediaVerificationsSchema } from "./mediaVerificationsSchema.ts";

export type MediaVerifications = z.infer<typeof mediaVerificationsSchema>;
