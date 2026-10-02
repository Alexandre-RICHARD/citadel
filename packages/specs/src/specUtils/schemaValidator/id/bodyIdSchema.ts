import { z } from "zod";

import { IdBoundEnum } from "./idBound.enum.ts";

// Dans un corps JSON, un id est un nombre : contrairement au chemin, aucune conversion depuis du texte
export function bodyIdSchema(label: string) {
	return z
		.number({
			message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
		})
		.int({ message: `${label} should be an integer (e.g. 7, not 7.5)` })
		.min(IdBoundEnum.MIN, {
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		})
		.max(IdBoundEnum.MAX, {
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		});
}
