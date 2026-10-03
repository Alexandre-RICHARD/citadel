import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { SqlDatetimeBoundEnum } from "./sqlDatetimeBound.enum.ts";

// Date ISO 8601 (avec décalage horaire accepté), ni dans le futur, ni avant ce que la base sait stocker.
// Au-delà de la milliseconde, la base tronque : c'est accepté
export function pastIsoDateTimeSchema(label: string) {
	return z.iso
		.datetime({
			offset: true,
			message: `${label} should be an ISO 8601 datetime`,
			abort: true,
		})
		.refine((date) => new Date(date).getTime() <= Date.now(), {
			message: `${label} should not be in the future`,
			params: { code: ValidationIssueCodeEnum.FUTURE_DATE },
		})
		.refine(
			(date) =>
				new Date(date).getTime() >= Date.parse(SqlDatetimeBoundEnum.MIN),
			{
				message: `${label} should not be before ${SqlDatetimeBoundEnum.MIN}`,
				params: { code: ValidationIssueCodeEnum.DATE_TOO_OLD },
			},
		);
}
