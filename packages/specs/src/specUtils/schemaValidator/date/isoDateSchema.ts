import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { SqlDatetimeBoundEnum } from "./sqlDatetimeBound.enum.ts";

// Même plancher qu'une colonne DATETIME, réduit au jour : "1000-01-01"
const OLDEST_ISO_DATE = SqlDatetimeBoundEnum.MIN.slice(0, "YYYY-MM-DD".length);

// Date seule, sans heure ni fuseau ("2026-10-21") : un jour du calendrier, comme une date de fin de jeu.
// Le format refuse aussi les jours qui n'existent pas (2026-02-30)
export function isoDateSchema(label: string) {
	return z.iso
		.date({
			message: `${label} should be an ISO 8601 date (e.g. 2026-10-21)`,
			abort: true,
		})
		.refine((date) => date >= OLDEST_ISO_DATE, {
			message: `${label} should not be before ${OLDEST_ISO_DATE}`,
			params: { code: ValidationIssueCodeEnum.DATE_TOO_OLD },
		});
}
