import { z } from "zod";

export const setBossDefeatedBodySchema = z.object({
	defeated: z.boolean({ message: "Defeated should be boolean" }),
});
