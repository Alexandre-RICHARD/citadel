import { z } from "zod";

export const deleteDeathPathParamSchema = z.object({
	id: z.coerce
		.number({ message: "ID should be integer" })
		.int()
		.positive({ message: "ID should be positive" }),
});
