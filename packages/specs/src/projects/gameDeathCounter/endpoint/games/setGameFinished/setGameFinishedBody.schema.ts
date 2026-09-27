import { z } from "zod";

export const setGameFinishedBodySchema = z.object({
	finished: z.boolean({ message: "Finished should be boolean" }),
});
