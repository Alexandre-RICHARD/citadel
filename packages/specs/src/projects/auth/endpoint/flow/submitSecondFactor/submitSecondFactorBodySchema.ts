import { z } from "zod";

import { SecondFactorMethodEnum } from "../../../enum/secondFactorMethod.enum.ts";
import { mailCodeSchema } from "../../../schema/mailCodeSchema.ts";
import { recoveryCodeSchema } from "../../../schema/recoveryCodeSchema.ts";
import { totpCodeSchema } from "../../../schema/totpCodeSchema.ts";

// Le code, selon ce qui le donne : l'application d'authentification (essayé sur chaque TOTP du compte), l'email, ou un
// code de secours
export const submitSecondFactorBodySchema = z.discriminatedUnion("method", [
	z.object({
		method: z.literal(SecondFactorMethodEnum.TOTP),
		code: totpCodeSchema,
	}),
	z.object({
		method: z.literal(SecondFactorMethodEnum.EMAIL),
		code: mailCodeSchema,
	}),
	z.object({
		method: z.literal(SecondFactorMethodEnum.RECOVERY_CODE),
		code: recoveryCodeSchema,
	}),
]);
