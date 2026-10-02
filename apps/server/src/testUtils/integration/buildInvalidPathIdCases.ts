import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id de chemin, avec le message attendu pour ce libellé
export function buildInvalidPathIdCases(label: string): {
	reason: string;
	pathValue: string;
	message: string;
}[] {
	const formatMessage = `${label} has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)`;
	return [
		{ reason: "text", pathValue: "abc", message: formatMessage },
		{
			reason: "a number followed by text",
			pathValue: "12abc",
			message: formatMessage,
		},
		{ reason: "Infinity", pathValue: "Infinity", message: formatMessage },
		{ reason: "a decimal", pathValue: "1.5", message: formatMessage },
		{ reason: "a negative number", pathValue: "-7", message: formatMessage },
		{
			reason: "preceded by a plus sign",
			pathValue: "+5",
			message: formatMessage,
		},
		{
			reason: "written with leading zeros",
			pathValue: "007",
			message: formatMessage,
		},
		{
			reason: "in scientific notation",
			pathValue: "1e3",
			message: formatMessage,
		},
		{ reason: "in hexadecimal", pathValue: "0x10", message: formatMessage },
		{ reason: "in binary", pathValue: "0b11", message: formatMessage },
		{ reason: "a space", pathValue: "%20", message: formatMessage },
		{
			reason: "surrounded by spaces",
			pathValue: "%207%20",
			message: formatMessage,
		},
		{
			reason: "zero",
			pathValue: "0",
			message: `${label} should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "beyond the maximum of an INT column",
			pathValue: String(IdBoundEnum.MAX + 1),
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
		{
			reason: "too long to be an exact JavaScript number",
			pathValue: "99999999999999999999",
			message: `${label} should be at most ${IdBoundEnum.MAX}`,
		},
	];
}
