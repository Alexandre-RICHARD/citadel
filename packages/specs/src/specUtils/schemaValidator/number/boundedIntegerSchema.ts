import { z } from "zod";

// Nombre entier d'un corps JSON, entre deux bornes incluses : un compteur, une durée en minutes, une note
export function boundedIntegerSchema(label: string, min: number, max: number) {
	return z
		.number({
			message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
		})
		.int({ message: `${label} should be an integer (e.g. 7, not 7.5)` })
		.min(min, { message: `${label} should be at least ${min}` })
		.max(max, { message: `${label} should be at most ${max}` });
}
