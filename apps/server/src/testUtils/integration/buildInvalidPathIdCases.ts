import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id de chemin, avec le message attendu pour ce libellé
export function buildInvalidPathIdCases(label: string): {
	reason: string;
	pathValue: string;
	message: string;
}[] {
	return [
		{
			reason: "du texte",
			pathValue: "abc",
			message: `${label} should be a number`,
		},
		{
			reason: "un nombre suivi de texte",
			pathValue: "12abc",
			message: `${label} should be a number`,
		},
		{
			reason: "Infinity",
			pathValue: "Infinity",
			message: `${label} should be a number`,
		},
		{
			reason: "un décimal",
			pathValue: "1.5",
			message: `${label} should be an integer`,
		},
		{
			reason: "zéro",
			pathValue: "0",
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "un négatif",
			pathValue: "-7",
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "un espace, converti en 0",
			pathValue: "%20",
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "au-delà du maximum d'une colonne INT",
			pathValue: String(IdBoundEnum.MAX + 1),
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
	];
}
