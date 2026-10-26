import { z } from "zod";

import { SqlIntegerBoundEnum } from "../../../specUtils/schemaValidator/number/sqlIntegerBound.enum.ts";

// id de plateforme dans un corps JSON : celui d'IGDB, ou un id négatif pour un émulateur ; jamais 0
export function platformIdSchema(label: string) {
	return z
		.number({
			message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
		})
		.int({ message: `${label} should be an integer (e.g. 7, not 7.5)` })
		.min(SqlIntegerBoundEnum.MIN, {
			message: `${label} should be at least ${SqlIntegerBoundEnum.MIN}`,
		})
		.max(SqlIntegerBoundEnum.MAX, {
			message: `${label} should be at most ${SqlIntegerBoundEnum.MAX}`,
		})
		.refine((id) => id !== 0, { message: `${label} should not be 0` });
}
