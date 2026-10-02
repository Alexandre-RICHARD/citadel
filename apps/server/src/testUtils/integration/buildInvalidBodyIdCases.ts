import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id du corps : contrairement au chemin, aucune conversion depuis une chaîne
export function buildInvalidBodyIdCases(label: string): {
	reason: string;
	value: unknown;
	message: string;
}[] {
	return [
		{
			reason: "missing",
			value: undefined,
			message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
		},
		{
			reason: "null",
			value: null,
			message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
		},
		{
			reason: "a number written as a string",
			value: "3",
			message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
		},
		{
			reason: "a decimal",
			value: 1.5,
			message: `${label} should be an integer (e.g. 7, not 7.5)`,
		},
		{
			reason: "zero",
			value: 0,
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "a negative number",
			value: -2,
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "beyond the maximum of an INT column",
			value: IdBoundEnum.MAX + 1,
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
	];
}
