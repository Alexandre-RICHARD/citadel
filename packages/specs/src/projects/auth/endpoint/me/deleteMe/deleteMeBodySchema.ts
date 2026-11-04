import { z } from "zod";

import { SecondFactorMethodEnum } from "../../../enum/secondFactorMethod.enum.ts";
import { recoveryCodeSchema } from "../../../schema/recoveryCodeSchema.ts";
import { totpCodeSchema } from "../../../schema/totpCodeSchema.ts";
import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

// Le mot de passe, et, si le compte a une application d'authentification, un code de celle-ci ou un code de secours.
// Jamais le code par email : il demanderait un mail de plus, pour une boîte que le mot de passe oublié sait déjà ouvrir
const secondFactorSchema = z.discriminatedUnion("method", [
	z.object({
		method: z.literal(SecondFactorMethodEnum.TOTP),
		code: totpCodeSchema,
	}),
	z.object({
		method: z.literal(SecondFactorMethodEnum.RECOVERY_CODE),
		code: recoveryCodeSchema,
	}),
]);

export const deleteMeBodySchema = z.object({
	password: typedPasswordSchema,
	secondFactor: secondFactorSchema.optional(),
});
