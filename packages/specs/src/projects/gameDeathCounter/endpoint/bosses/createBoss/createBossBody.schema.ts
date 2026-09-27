import { z } from "zod";

export const createBossBodySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Name should contains at least 1 character" })
		.max(255, { message: "Name should contains less than 256 characters" }),
	gameId: z
		.number({ message: "Game ID should be integer" })
		.int()
		.positive({ message: "Game ID should be positive" }),
});
