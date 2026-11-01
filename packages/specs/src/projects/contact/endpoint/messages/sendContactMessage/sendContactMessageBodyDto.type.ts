import type { z } from "zod";

import type { sendContactMessageBodySchema } from "./sendContactMessageBodySchema.ts";

export type SendContactMessageBodyDto = z.infer<
	typeof sendContactMessageBodySchema
>;
