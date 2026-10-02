import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id de chemin, avec le message attendu pour ce libellé
export function buildInvalidPathIdCases(label: string): {
	reason: string;
	pathValue: string;
	message: string;
}[] {
	const formatMessage = `${label} has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)`;
	return [
		{ reason: "du texte", pathValue: "abc", message: formatMessage },
		{
			reason: "un nombre suivi de texte",
			pathValue: "12abc",
			message: formatMessage,
		},
		{ reason: "Infinity", pathValue: "Infinity", message: formatMessage },
		{ reason: "un décimal", pathValue: "1.5", message: formatMessage },
		{ reason: "un négatif", pathValue: "-7", message: formatMessage },
		{ reason: "précédé d'un +", pathValue: "+5", message: formatMessage },
		{
			reason: "avec des zéros en tête",
			pathValue: "007",
			message: formatMessage,
		},
		{
			reason: "en notation scientifique",
			pathValue: "1e3",
			message: formatMessage,
		},
		{ reason: "en hexadécimal", pathValue: "0x10", message: formatMessage },
		{ reason: "en binaire", pathValue: "0b11", message: formatMessage },
		{ reason: "un espace", pathValue: "%20", message: formatMessage },
		{
			reason: "entouré d'espaces",
			pathValue: "%207%20",
			message: formatMessage,
		},
		{
			reason: "zéro",
			pathValue: "0",
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "au-delà du maximum d'une colonne INT",
			pathValue: String(IdBoundEnum.MAX + 1),
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
		{
			reason: "trop long pour être un nombre exact en JavaScript",
			pathValue: "99999999999999999999",
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
	];
}
