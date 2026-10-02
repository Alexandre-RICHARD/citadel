import { z } from "zod";

import { IdBoundEnum } from "./idBound.enum.ts";

export function bodyIdSchema(label: string) {
	return z
		.number({ message: `${label} should be a number` })
		.int({ message: `${label} should be an integer` })
		.min(IdBoundEnum.MIN, {
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		})
		.max(IdBoundEnum.MAX, {
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		});
}
