// Toutes les raisons de refuser un booléen du corps. `value: undefined` : champ absent du JSON
export function buildInvalidBooleanCases(label: string): {
	reason: string;
	value: unknown;
	message: string;
}[] {
	const message = `${label} should be a boolean`;
	return [
		{ reason: "missing", value: undefined, message },
		{ reason: "null", value: null, message },
		{ reason: 'the string "true"', value: "true", message },
		{ reason: "the number 1", value: 1, message },
		{ reason: "the number 0", value: 0, message },
	];
}
