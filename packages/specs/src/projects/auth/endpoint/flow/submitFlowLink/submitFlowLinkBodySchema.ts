import { z } from "zod";

import { linkTokenSchema } from "../../../schema/linkTokenSchema.ts";
import { usernameSchema } from "../../../schema/usernameSchema.ts";

export const submitFlowLinkBodySchema = z.object({
	// Lu par /auth/verify dans le fragment du lien (#…), que le navigateur n'envoie jamais à un serveur
	token: linkTokenSchema,
	// Inscription seulement : le nouveau pseudo, quand celui choisi a été pris entre-temps (409 USERNAME_TAKEN)
	username: usernameSchema.optional(),
});
