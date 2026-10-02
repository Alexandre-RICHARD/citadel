import { z } from "zod";

import { IdBoundEnum } from "./idBound.enum.ts";

// Un path param arrive toujours en chaîne : il est converti en nombre avant validation
export function pathParamIdSchema(label: string) {
	return z.coerce
		.number({ message: `${label} should be a number` })
		.int({ message: `${label} should be an integer` })
		.min(IdBoundEnum.MIN, {
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		})
		.max(IdBoundEnum.MAX, {
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		});
}
