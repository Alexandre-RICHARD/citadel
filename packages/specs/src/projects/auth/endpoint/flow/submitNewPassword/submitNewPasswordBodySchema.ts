import { z } from "zod";

import { passwordSchema } from "../../../schema/passwordSchema.ts";

// La confirmation (le mot de passe tapé deux fois) se vérifie dans le navigateur : seul le mot de passe part
export const submitNewPasswordBodySchema = z.object({
	password: passwordSchema,
});
