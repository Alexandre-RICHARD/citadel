import { z } from "zod";

export const getOneGamePathParamSchema = z.object({
	id: z.coerce
		.number({ message: "ID should be integer" })
		.int()
		.positive({ message: "ID should be positive" }),
});
