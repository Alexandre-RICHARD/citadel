import z from "zod";

export const createGameBodySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Name should contains at least 1 character" })
		.max(255, { message: "Name should contains less than 256 characters" }),
});
