import type { z } from "zod";

import type { setMediaVerifiedBodySchema } from "./setMediaVerifiedBodySchema.ts";

export type SetMediaVerifiedBodyDto = z.infer<
	typeof setMediaVerifiedBodySchema
>;
