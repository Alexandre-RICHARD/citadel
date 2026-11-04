import { z } from "zod";

import { requireAtLeastOneField } from "../../../../../specUtils/schemaValidator/object/requireAtLeastOneField.ts";
import { LoginMethodEnum } from "../../../enum/loginMethod.enum.ts";
import { displayNameSchema } from "../../../schema/displayNameSchema.ts";

// Seuls le pseudo affiché et les méthodes de connexion se changent sans autre formalité : le mot de passe et l'email
// ont leurs endpoints. Un champ absent reste tel quel ; un pseudo affiché vide redonne le pseudo
export const updateMeBodySchema = requireAtLeastOneField(
	z.object({
		displayName: displayNameSchema.optional(),
		loginMethods: z
			.enum(LoginMethodEnum, { message: "Login methods are not valid" })
			.optional(),
	}),
);
