import { z } from "zod";

export const deleteBossPathParamSchema = z.object({
	id: z.coerce
		.number({ message: "ID should be integer" })
		.int()
		.positive({ message: "ID should be positive" }),
});
