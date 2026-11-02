import { z } from "zod";

import { mailCodeSchema } from "../../../schema/mailCodeSchema.ts";
import { usernameSchema } from "../../../schema/usernameSchema.ts";

export const submitFlowCodeBodySchema = z.object({
	code: mailCodeSchema,
	// Inscription seulement : le nouveau pseudo, quand celui choisi a été pris entre-temps (409 USERNAME_TAKEN)
	username: usernameSchema.optional(),
});
