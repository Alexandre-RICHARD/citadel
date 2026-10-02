import { assert } from "./assert.ts";

// NaN est refusé : typeof NaN vaut "number", mais c'est le résultat d'un calcul ou d'une conversion ratée
export function assertNumber(
	value: unknown,
	errorContext?: string,
): asserts value is number {
	assert(
		typeof value === "number" && !Number.isNaN(value),
		`${errorContext ?? "assertNumber"} → value is not a number`,
	);
}
