import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";
import { z } from "zod";

import { IdBoundEnum } from "./idBound.enum.ts";

/**
 * Un path param arrive toujours en chaîne. Sa forme est vérifiée avant la conversion :
 * Number() accepterait sinon "1e3", "0x10", "007" ou " 7 ", soit plusieurs URL pour une même ressource
 */
export function pathParamIdSchema(label: string) {
	return z
		.string({ message: `${label} should be a number` })
		.regex(regexDictionary.decimalInteger, {
			message: `${label} has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)`,
		})
		.transform(Number)
		.pipe(
			z
				.number()
				.min(IdBoundEnum.MIN, {
					message: `${label} should be at least ${IdBoundEnum.MIN}`,
				})
				.max(IdBoundEnum.MAX, {
					message: `${label} should be at most ${IdBoundEnum.MAX}`,
				}),
		);
}
