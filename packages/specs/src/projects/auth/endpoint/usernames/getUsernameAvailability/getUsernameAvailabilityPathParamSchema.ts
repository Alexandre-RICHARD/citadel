import { z } from "zod";

import { usernameSchema } from "../../../schema/usernameSchema.ts";

export const getUsernameAvailabilityPathParamSchema = z.object({
	username: usernameSchema,
});
