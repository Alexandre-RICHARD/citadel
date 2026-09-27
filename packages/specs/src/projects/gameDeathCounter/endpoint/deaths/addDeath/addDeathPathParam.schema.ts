import { z } from "zod";

export const addDeathPathParamSchema = z.object({
	bossId: z.coerce
		.number({ message: "Boss ID should be integer" })
		.int()
		.positive({ message: "Boss ID should be positive" }),
});
