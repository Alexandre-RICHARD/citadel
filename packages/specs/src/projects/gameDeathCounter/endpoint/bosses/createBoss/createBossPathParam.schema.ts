import { z } from "zod";

export const createBossPathParamSchema = z.object({
	gameId: z.coerce
		.number({ message: "Game ID should be integer" })
		.int()
		.positive({ message: "Game ID should be positive" }),
});
