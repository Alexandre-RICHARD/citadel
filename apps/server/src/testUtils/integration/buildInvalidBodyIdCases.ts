import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id du corps : contrairement au chemin, aucune conversion depuis une chaîne
export function buildInvalidBodyIdCases(label: string): {
	reason: string;
	value: unknown;
	message: string;
}[] {
	return [
		{
			reason: "absent",
			value: undefined,
			message: `${label} should be a number`,
		},
		{ reason: "null", value: null, message: `${label} should be a number` },
		{
			reason: "un nombre écrit en chaîne",
			value: "3",
			message: `${label} should be a number`,
		},
		{
			reason: "un décimal",
			value: 1.5,
			message: `${label} should be an integer`,
		},
		{
			reason: "zéro",
			value: 0,
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "un négatif",
			value: -2,
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "au-delà du maximum d'une colonne INT",
			value: IdBoundEnum.MAX + 1,
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
	];
}
