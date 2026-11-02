import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { honeypotSchema } from "../../../../../specUtils/schemaValidator/string/honeypotSchema.ts";
import { emailSchema } from "../../../schema/emailSchema.ts";
import { passwordSchema } from "../../../schema/passwordSchema.ts";
import { usernameSchema } from "../../../schema/usernameSchema.ts";

// La confirmation du mot de passe se vérifie dans le navigateur : seul le mot de passe part
export const startRegistrationBodySchema = z.object({
	email: emailSchema,
	username: usernameSchema,
	password: passwordSchema,
	remember: booleanSchema("Remember"),
	website: honeypotSchema("Website"),
});
