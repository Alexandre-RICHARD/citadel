import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum";
import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type";
import { SqlDatetimeBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/date/sqlDatetimeBound.enum";

const OLDEST_YEAR = new Date(SqlDatetimeBoundEnum.MIN).getUTCFullYear();

function pluralize(count: number, word: string): string {
	return `${count} ${word}${count > 1 ? "s" : ""}`;
}

// `limit` n'est présent que pour les règles de longueur et de borne
const phrases: Record<
	ValidationIssueCodeEnum,
	(limit: number | undefined) => string
> = {
	[ValidationIssueCodeEnum.INVALID_TYPE]: () => "n'a pas le type attendu",
	[ValidationIssueCodeEnum.INVALID_FORMAT]: () => "n'est pas au format attendu",
	[ValidationIssueCodeEnum.INVALID_CHARACTERS]: () =>
		"contient des caractères invalides",
	[ValidationIssueCodeEnum.TOO_SHORT]: (limit) =>
		`doit contenir au moins ${pluralize(limit ?? 0, "caractère")}`,
	[ValidationIssueCodeEnum.TOO_LONG]: (limit) =>
		`doit contenir au plus ${pluralize(limit ?? 0, "caractère")}`,
	[ValidationIssueCodeEnum.TOO_SMALL]: (limit) =>
		`doit valoir au moins ${limit ?? 0}`,
	[ValidationIssueCodeEnum.TOO_BIG]: (limit) =>
		`doit valoir au plus ${limit ?? 0}`,
	[ValidationIssueCodeEnum.NOT_INTEGER]: () => "doit être un nombre entier",
	[ValidationIssueCodeEnum.FUTURE_DATE]: () => "ne peut pas être dans le futur",
	[ValidationIssueCodeEnum.DATE_TOO_OLD]: () =>
		`ne peut pas précéder l'an ${OLDEST_YEAR}`,
	// Porte sur le corps entier, pas sur un champ : la phrase se suffit à elle-même
	[ValidationIssueCodeEnum.MISSING_FIELDS]: () =>
		"au moins un champ doit être renseigné",
	[ValidationIssueCodeEnum.INVALID_VALUE]: () => "n'est pas valide",
};

// Fin de phrase sans sujet : sous un champ, elle se lit seule ; dans un toast, elle suit le nom du champ (« le nom doit… »)
export function getValidationIssuePhrase({
	code,
	limit,
}: Pick<ValidationIssueDto, "code" | "limit">): string {
	return phrases[code](limit);
}
