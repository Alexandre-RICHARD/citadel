import { z } from "zod";

import { StatusEnum } from "../enum/status.enum.ts";

export const statusSchema = z.enum(StatusEnum, {
	message: `Status should be one of: ${Object.values(StatusEnum).join(", ")}`,
});
