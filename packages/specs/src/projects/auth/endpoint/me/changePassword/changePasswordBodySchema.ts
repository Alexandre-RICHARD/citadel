import { z } from "zod";

import { passwordSchema } from "../../../schema/passwordSchema.ts";
import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

// La confirmation du nouveau mot de passe (tapé deux fois) se vérifie dans le navigateur : seul le nouveau part
export const changePasswordBodySchema = z.object({
	currentPassword: typedPasswordSchema,
	newPassword: passwordSchema,
});
